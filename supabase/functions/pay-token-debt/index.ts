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
    const supabaseUrl = Deno.env.get('APP_SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('APP_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse optional billing_cycle_id
    let billingCycleId: string | null = null
    try {
      const body = await req.json()
      billingCycleId = body?.billing_cycle_id ?? null
    } catch {
      // No body — pay all unpaid cycles
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, stripe_payment_method_id, subscription_status, token_debt')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    if (!profile?.stripe_customer_id || !profile?.stripe_payment_method_id) {
      return new Response(
        JSON.stringify({ error: 'No payment method on file. Please add a payment method first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch unpaid billing cycles
    let cyclesQuery = supabase
      .from('weekly_billing_cycles')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'failed'])

    if (billingCycleId) {
      cyclesQuery = cyclesQuery.eq('id', billingCycleId)
    }

    const { data: cycles, error: cyclesError } = await cyclesQuery

    if (cyclesError) {
      throw new Error(`Failed to fetch billing cycles: ${cyclesError.message}`)
    }

    if (!cycles || cycles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No outstanding billing cycles to pay', paid: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate total amount
    const totalDebt = cycles.reduce(
      (sum: number, cycle: { token_debt: number }) => sum + (cycle.token_debt || 0),
      0
    )

    if (totalDebt <= 0) {
      return new Response(
        JSON.stringify({ message: 'No debt to pay', paid: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Amount in cents (AUD)
    const amountCents = Math.round(totalDebt * 100)

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'aud',
      customer: profile.stripe_customer_id,
      payment_method: profile.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      metadata: {
        user_id: user.id,
        billing_cycle_ids: cycles.map((c: { id: string }) => c.id).join(','),
        total_debt: totalDebt.toString(),
      },
    })

    // Mark all cycles as paid
    const cycleIds = cycles.map((c: { id: string }) => c.id)
    await supabase
      .from('weekly_billing_cycles')
      .update({
        status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
      })
      .in('id', cycleIds)

    // Clear token debt
    await supabase
      .from('user_profiles')
      .update({ token_debt: 0 })
      .eq('id', user.id)

    // Reactivate user if paused
    if (profile.subscription_status === 'paused') {
      await supabase
        .from('user_profiles')
        .update({ subscription_status: 'active' })
        .eq('id', user.id)
    }

    // Insert token_transactions records for each cycle
    const transactions = cycles.map((cycle: { id: string; token_debt: number; week_start: string; week_end: string }) => ({
      user_id: user.id,
      type: 'debt_paid',
      amount: cycle.token_debt,
      billing_cycle_id: cycle.id,
      stripe_payment_intent_id: paymentIntent.id,
      description: `Payment for billing cycle ${cycle.week_start} to ${cycle.week_end}`,
    }))

    const { error: txError } = await supabase
      .from('token_transactions')
      .insert(transactions)

    if (txError) {
      console.error(`Failed to insert token transactions: ${txError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_intent_id: paymentIntent.id,
        amount: totalDebt,
        cycles_paid: cycleIds.length,
        reactivated: profile.subscription_status === 'paused',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
