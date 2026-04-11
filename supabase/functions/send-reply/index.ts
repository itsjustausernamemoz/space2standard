import nodemailer from "npm:nodemailer@6.9.16";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, message, originalMessage } = await req.json();
    
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'mail.privateemail.com';
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const SMTP_USER = Deno.env.get('SMTP_USER');
    const SMTP_PASS = Deno.env.get('SMTP_PASS');
    const BUSINESS_NAME = Deno.env.get('BUSINESS_NAME') || 'Space2Standard';

    console.log(`[SMTP] Attempting delivery to: ${to} via ${SMTP_HOST}`);

    if (!SMTP_USER || !SMTP_PASS) {
      return new Response(JSON.stringify({ error: "SMTP credentials (USER/PASS) are missing in Supabase Secrets." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Required for some segments of Namecheap infrastructure
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      debug: false,
      logger: false
    });

    const htmlBody = `
      <div style="font-family: sans-serif; color: #0f172a; line-height: 1.5; padding: 20px;">
        <h2 style="color: #c19b3a; border-bottom: 1px solid #c19b3a20; padding-bottom: 10px;">${BUSINESS_NAME} Artisan Response</h2>
        <p style="margin-vertical: 20px; white-space: pre-wrap;">${message}</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
          <strong>Original Inquiry:</strong>
          <p style="font-style: italic; border-left: 2px solid #e2e8f0; padding-left: 10px;">${originalMessage}</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${BUSINESS_NAME}" <${SMTP_USER}>`,
      to: to,
      replyTo: SMTP_USER,
      subject: subject,
      html: htmlBody,
    });

    console.log(`[SMTP] Successfully sent to ${to}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error(`[SMTP ERROR] ${error.name}: ${error.message}`);
    
    // Categorize errors for the UI
    let userFriendlyError = error.message;
    if (error.code === 'EAUTH') userFriendlyError = "Authentication failed. Please verify your SMTP password.";
    if (error.code === 'ECONNREFUSED') userFriendlyError = "Connection refused. Check SMTP host and port.";
    if (error.code === 'ETIMEOUT') userFriendlyError = "Connection timed out. The SMTP server is not responding.";

    return new Response(JSON.stringify({ 
      error: userFriendlyError,
      details: error.code || error.name 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
