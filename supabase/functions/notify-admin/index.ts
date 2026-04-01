// @ts-nocheck
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  try {
    const { record } = await req.json();

    if (!record) {
      return new Response(JSON.stringify({ error: 'No record provided' }), { status: 400 });
    }

    const emailContent = {
      from: 'Space2Standard <orders@space2standard.com>',
      to: 'admin@space2standard.com', // Set this in Supabase dashboard
      subject: `New Order Received: #${record.id.slice(0, 8)}`,
      html: `
        <div style="font-family: serif; color: #3d2314; padding: 40px; border: 1px solid #c9a84c20;">
          <h1 style="color: #c9a84c;">New Inquiry Received</h1>
          <p>Hello Artisan,</p>
          <p>A new order has been submitted via the storefront. Master this request in your dashboard.</p>
          
          <div style="background: #faf8f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Customer:</strong> ${record.customer_name}</p>
            <p><strong>Email:</strong> ${record.customer_email}</p>
            <p><strong>Phone:</strong> ${record.customer_phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${record.delivery_address || 'N/A'}</p>
            <p><strong>Inquiry Notes:</strong> ${record.special_notes || 'None'}</p>
          </div>
          
          <a href="https://dashboard.space2standard.com/orders" style="display: inline-block; background: #3d2314; color: #e8d5b7; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">
            Manage Order
          </a>
          
          <p style="margin-top: 40px; font-size: 10px; color: #888;">Space2Standard System Automaton</p>
        </div>
      `,
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailContent),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
