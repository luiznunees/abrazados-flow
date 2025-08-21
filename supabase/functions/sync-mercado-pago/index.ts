import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MercadoPagoPayment {
  id: string;
  status: string;
  external_reference?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Mercado Pago access token from secrets
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mercadoPagoToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    // Sync payments from Mercado Pago API
    console.log('Starting Mercado Pago sync...');

    // Get recent payments from Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/search`, {
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mpResponse.ok) {
      throw new Error(`Mercado Pago API error: ${mpResponse.status}`);
    }

    const mpData = await mpResponse.json();
    const payments: MercadoPagoPayment[] = mpData.results || [];

    let updatedCount = 0;

    // Update registration status based on payment status
    for (const payment of payments) {
      if (payment.status === 'approved' && payment.external_reference) {
        // Update registration status to 'paid'
        const { error } = await supabaseAdmin
          .from('registrations')
          .update({ 
            status: 'paid',
            mercado_pago_payment_id: payment.id 
          })
          .eq('id', payment.external_reference);

        if (error) {
          console.error('Error updating registration:', error);
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`Updated ${updatedCount} registrations`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${payments.length} payments, updated ${updatedCount} registrations` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});