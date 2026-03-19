import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getLastMonday(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff - 7) // Last Monday
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

function getLastSunday(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 0 : 7 - day
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - diff - 7 + (day === 0 ? -7 : 0))
  // Actually compute: last Sunday = last Monday + 6
  const monday = new Date(getLastMonday())
  const sun = new Date(monday)
  sun.setDate(monday.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return sun.toISOString().slice(0, 10)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const weekStart = getLastMonday()
    const weekEnd = getLastSunday()

    // Get all active/trial users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, stripe_customer_id, stripe_payment_method_id')
      .in('subscription_status', ['active', 'trial'])

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active users to bill', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: { user_id: string; status: string; token_debt?: number; error?: string }[] = []

    for (const user of users) {
      try {
        // Sum net_profit_week across all bookmaker connections
        const { data: connections, error: connError } = await supabase
          .from('bookmaker_connections')
          .select('net_profit_week')
          .eq('user_id', user.id)

        if (connError) {
          results.push({ user_id: user.id, status: 'error', error: connError.message })
          continue
        }

        const grossProfit = (connections || []).reduce(
          (sum: number, c: { net_profit_week: number }) => sum + (c.net_profit_week || 0),
          0
        )

        // Calculate token debt
        const tokenDebt = grossProfit > 0 ? Math.floor(grossProfit * 0.30) : 0

        if (tokenDebt <= 0) {
          results.push({ user_id: user.id, status: 'no_debt', token_debt: 0 })
          continue
        }

        // Insert weekly billing cycle record
        const { data: cycle, error: cycleError } = await supabase
          .from('weekly_billing_cycles')
          .insert({
            user_id: user.id,
            week_start: weekStart,
            week_end: weekEnd,
            gross_profit: grossProfit,
            token_debt: tokenDebt,
            status: 'pending',
          })
          .select()
          .single()

        if (cycleError) {
          results.push({ user_id: user.id, status: 'error', error: cycleError.message })
          continue
        }

        // Attempt Stripe payment
        if (!user.stripe_customer_id || !user.stripe_payment_method_id) {
          // No payment method — mark failed and pause user
          await supabase
            .from('weekly_billing_cycles')
            .update({ status: 'failed' })
            .eq('id', cycle.id)

          await supabase
            .from('user_profiles')
            .update({ subscription_status: 'paused' })
            .eq('id', user.id)

          results.push({
            user_id: user.id,
            status: 'failed',
            token_debt: tokenDebt,
            error: 'No payment method on file',
          })
          continue
        }

        try {
          // Amount in cents (AUD)
          const amountCents = Math.round(tokenDebt * 100)

          const paymentIntent = await stripe.paymentIntents.create({
            amount: amountCents,
            currency: 'aud',
            customer: user.stripe_customer_id,
            payment_method: user.stripe_payment_method_id,
            off_session: true,
            confirm: true,
            metadata: {
              billing_cycle_id: cycle.id,
              user_id: user.id,
              week_start: weekStart,
              week_end: weekEnd,
            },
          })

          // Payment succeeded
          await supabase
            .from('weekly_billing_cycles')
            .update({
              status: 'paid',
              stripe_payment_intent_id: paymentIntent.id,
              paid_at: new Date().toISOString(),
            })
            .eq('id', cycle.id)

          // Reset token debt
          await supabase
            .from('user_profiles')
            .update({ token_debt: 0 })
            .eq('id', user.id)

          // Insert token transaction record
          await supabase.from('token_transactions').insert({
            user_id: user.id,
            type: 'debt_paid',
            amount: tokenDebt,
            billing_cycle_id: cycle.id,
            stripe_payment_intent_id: paymentIntent.id,
            description: `Weekly billing payment for ${weekStart} to ${weekEnd}`,
          })

          results.push({ user_id: user.id, status: 'paid', token_debt: tokenDebt })
        } catch (stripeErr) {
          // Payment failed
          await supabase
            .from('weekly_billing_cycles')
            .update({ status: 'failed' })
            .eq('id', cycle.id)

          await supabase
            .from('user_profiles')
            .update({ subscription_status: 'paused' })
            .eq('id', user.id)

          results.push({
            user_id: user.id,
            status: 'failed',
            token_debt: tokenDebt,
            error: (stripeErr as Error).message,
          })
        }
      } catch (err) {
        results.push({ user_id: user.id, status: 'error', error: (err as Error).message })
      }
    }

    return new Response(
      JSON.stringify({
        week_start: weekStart,
        week_end: weekEnd,
        processed: results.length,
        paid: results.filter((r) => r.status === 'paid').length,
        failed: results.filter((r) => r.status === 'failed').length,
        no_debt: results.filter((r) => r.status === 'no_debt').length,
        results,
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
