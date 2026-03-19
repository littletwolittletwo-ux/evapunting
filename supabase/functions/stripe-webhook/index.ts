import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get the raw body and signature header
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${(err as Error).message}`)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Find billing cycle(s) by stripe_payment_intent_id
        const { data: cycles, error: cyclesError } = await supabase
          .from('weekly_billing_cycles')
          .select('id, user_id')
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (cyclesError) {
          console.error(`Failed to find billing cycles: ${cyclesError.message}`)
          break
        }

        if (cycles && cycles.length > 0) {
          const cycleIds = cycles.map((c: { id: string }) => c.id)
          const userId = cycles[0].user_id

          // Mark cycles as paid
          await supabase
            .from('weekly_billing_cycles')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
            })
            .in('id', cycleIds)

          // Clear token debt and reactivate user
          await supabase
            .from('user_profiles')
            .update({
              token_debt: 0,
              subscription_status: 'active',
            })
            .eq('id', userId)

          console.log(`Payment succeeded for user ${userId}, cycles: ${cycleIds.join(', ')}`)
        } else {
          console.log(`No billing cycles found for payment intent ${paymentIntent.id}`)
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Find billing cycle(s) by stripe_payment_intent_id
        const { data: cycles, error: cyclesError } = await supabase
          .from('weekly_billing_cycles')
          .select('id, user_id')
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (cyclesError) {
          console.error(`Failed to find billing cycles: ${cyclesError.message}`)
          break
        }

        if (cycles && cycles.length > 0) {
          const cycleIds = cycles.map((c: { id: string }) => c.id)
          const userId = cycles[0].user_id

          // Mark cycles as failed
          await supabase
            .from('weekly_billing_cycles')
            .update({ status: 'failed' })
            .in('id', cycleIds)

          // Pause user
          await supabase
            .from('user_profiles')
            .update({ subscription_status: 'paused' })
            .eq('id', userId)

          console.log(`Payment failed for user ${userId}, cycles: ${cycleIds.join(', ')}`)
        } else {
          console.log(`No billing cycles found for failed payment intent ${paymentIntent.id}`)
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Always return 200 OK to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(`Webhook error: ${(err as Error).message}`)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
