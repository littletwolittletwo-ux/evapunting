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

    // Check if user already has a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    // Idempotent: return existing customer if already created
    if (profile?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ customer_id: profile.stripe_customer_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Stripe Customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    // Store customer ID in user_profiles
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id)

    if (updateError) {
      throw new Error(`Failed to store Stripe customer ID: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ customer_id: customer.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
