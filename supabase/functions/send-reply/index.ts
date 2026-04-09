import nodemailer from "npm:nodemailer@6.9.16";
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'mail.privateemail.com';
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465');
const SMTP_USER = Deno.env.get('SMTP_USER');
const SMTP_PASS = Deno.env.get('SMTP_PASS');
const BUSINESS_NAME = Deno.env.get('BUSINESS_NAME') || 'Space2Standard';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }

  try {
    const { to, subject, message, originalMessage } = await req.json();

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP credentials not configured in Supabase secrets.');
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Playfair Display', serif; color: #020617; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #c19b3a20;">
        <h2 style="color: #c19b3a; border-bottom: 1px solid #c19b3a40; padding-bottom: 10px;">${BUSINESS_NAME} Artisan Response</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #1e293b;">
          ${message.replace(/\n/g, '<br/>')}
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 15px;">Original Inquiry:</p>
          <blockquote style="margin: 0; padding-left: 20px; border-left: 3px solid #cbd5e1; italic; color: #94a3b8; font-size: 14px;">
            ${originalMessage}
          </blockquote>
        </div>
        
        <p style="margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center;">
          This message was sent with excellence from the Windhoek Atelier.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${BUSINESS_NAME}" <${SMTP_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error: any) {
    console.error('SMTP Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});
