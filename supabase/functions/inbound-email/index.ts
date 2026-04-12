import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let payload: any;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    }
    
    // 1. Extract core data from common parser formats (CloudMailin, Brevo, SendGrid)
    // We expect: from, to, subject, and body (plain or html)
    const rawFrom = payload.from || payload.sender || payload['sender[email]'] || payload.envelope?.from;
    const subject = payload.subject || 'No Subject';
    const body = payload.plain || payload.text || payload.content || payload['content[plain]'] || 'Empty body';
    
    // Clean up "From" which often looks like "John Doe <john@gmail.com>"
    const emailMatch = (rawFrom || '').match(/<([^>]+)>/) || [null, rawFrom || ''];
    const senderEmail = (emailMatch[1] || '').toLowerCase().trim();

    if (!senderEmail) {
      throw new Error('Could not resolve sender email from payload.');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Identify the Client
    const { data: client } = await supabase
      .from('clients')
      .select('id, full_name')
      .eq('email', senderEmail)
      .single();

    // 3. Log as Inbound Communication
    const { error: logError } = await supabase.from('communication_logs').insert({
      client_id: client?.id || null, // Link if exists, otherwise orphan for triage
      type: 'inbound',
      sender_name: client?.full_name || rawFrom.split('<')[0].trim(),
      sender_email: senderEmail,
      recipient_email: 'studio@space2standard.com',
      subject: subject,
      body: body,
      metadata: { 
        raw_payload: payload,
        is_untracked: !client
      }
    });

    if (logError) throw logError;

    // 4. Update any associated Inquiry status if found
    // (Optional: Link to thread if subject contains Ref ID)

    return new Response(JSON.stringify({ success: true, client_linked: !!client }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[Inbound Email Error]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
