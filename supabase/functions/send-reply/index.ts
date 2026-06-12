import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface UrlAttachment {
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      to,
      subject,
      message,
      recipientName,
      adminName,
      attachmentPath,
      documentType,
      attachments: urlAttachments,
    } = await req.json();

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch Business Settings
    const { data: settingsData } = await supabase.from('settings').select('*');
    const settings = settingsData?.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});

    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'mail.privateemail.com';
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const SMTP_USER = Deno.env.get('SMTP_USER');
    const SMTP_PASS = Deno.env.get('SMTP_PASS');

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP credentials not configured.');
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: false }
    });

    const businessName = settings?.business_name || 'Space2Standard';
    const businessAddress = settings?.business_address || 'Windhoek, Namibia';
    const businessPhone = settings?.business_phone || '';
    const businessEmail = settings?.business_email || SMTP_USER;

    const attachments: any[] = [];

    // Legacy: fetch single document from storage path (used by invoices/quotations)
    if (attachmentPath) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('communications')
        .download(attachmentPath);

      if (fileError) {
        console.error(`[SMTP ERROR] Attachment download failed: ${fileError.message}`);
      } else {
        const buffer = await fileData.arrayBuffer();
        attachments.push({
          filename: `${documentType || 'Document'}.pdf`,
          content: new Uint8Array(buffer),
          contentType: 'application/pdf'
        });
      }
    }

    // Fetch files from public URLs (used by Messages reply attachments)
    if (Array.isArray(urlAttachments) && urlAttachments.length > 0) {
      await Promise.all(
        (urlAttachments as UrlAttachment[]).map(async (att) => {
          try {
            const res = await fetch(att.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buffer = await res.arrayBuffer();
            attachments.push({
              filename: att.name,
              content: new Uint8Array(buffer),
              contentType: att.mimeType || 'application/octet-stream',
            });
          } catch (err: any) {
            console.error(`[SMTP ERROR] Could not fetch attachment ${att.name}: ${err.message}`);
          }
        })
      );
    }

    const hasAttachments = attachments.length > 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #c19b3a; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-text { font-size: 24px; font-weight: bold; color: #c19b3a; letter-spacing: 2px; text-transform: uppercase; }
          .content { font-size: 16px; margin-bottom: 30px; }
          .greeting { font-weight: bold; font-size: 18px; margin-bottom: 20px; }
          .message { white-space: pre-wrap; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
          .signature { margin-bottom: 20px; }
          .signature-name { font-weight: bold; color: #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-text">${businessName}</div>
          </div>
          <div class="content">
            <div class="greeting">Dear ${recipientName || 'Valued Client'},</div>
            <div class="message">${message}</div>
            ${hasAttachments ? `<p style="margin-top: 30px; color: #64748b; font-size: 14px;"><strong>Note:</strong> ${attachments.length === 1 ? 'A file has' : `${attachments.length} files have`} been attached to this email for your reference.</p>` : ''}
          </div>
          <div class="footer">
            <div class="signature">
              <p>Best regards,</p>
              <p class="signature-name">${adminName || 'Artisan Admin'}</p>
              <p>${businessName}</p>
            </div>
            <p>${businessAddress}<br/>${businessPhone}<br/>${businessEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${businessName}" <${SMTP_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      attachments: attachments
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[Email Error]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
