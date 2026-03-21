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

  // Webhooks must be POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Verify webhook signature — this is the critical security check.
    // constructEvent will throw if the signature is invalid, the body
    // has been tampered with, or the webhook secret is wrong.
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
          .select('id, user_id, status')
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (cyclesError) {
          console.error(`Failed to find billing cycles: ${cyclesError.message}`)
          break
        }

        if (cycles && cycles.length > 0) {
          // Idempotency: skip if already paid
          const unpaidCycles = cycles.filter((c: { status: string }) => c.status !== 'paid')
          if (unpaidCycles.length === 0) break

          const cycleIds = unpaidCycles.map((c: { id: string }) => c.id)
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
          .select('id, user_id, status')
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (cyclesError) {
          console.error(`Failed to find billing cycles: ${cyclesError.message}`)
          break
        }

        if (cycles && cycles.length > 0) {
          // Idempotency: skip if already handled
          const actionable = cycles.filter((c: { status: string }) => c.status !== 'failed' && c.status !== 'paid')
          if (actionable.length === 0) break

          const cycleIds = actionable.map((c: { id: string }) => c.id)
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

      case 'setup_intent.succeeded': {
        // When a user saves a new payment method via SetupIntent
        const setupIntent = event.data.object as Stripe.SetupIntent
        const customerId = setupIntent.customer as string | null
        const paymentMethodId = typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : (setupIntent.payment_method as { id: string } | null)?.id ?? null

        if (customerId && paymentMethodId) {
          // Update the user's default payment method
          await supabase
            .from('user_profiles')
            .update({ stripe_payment_method_id: paymentMethodId })
            .eq('stripe_customer_id', customerId)

          console.log(`Updated payment method for customer ${customerId}`)
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
