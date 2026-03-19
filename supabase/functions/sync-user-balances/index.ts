import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookmakerAccount {
  bookmaker: string
  balance: number
  net_profit_alltime: number
  net_profit_week: number
  bets_placed_week: number
  last_bet_at: string | null
}

interface BalancesResponse {
  user_external_id: string
  accounts: BookmakerAccount[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse optional user_id from request body
    let targetUserId: string | null = null
    try {
      const body = await req.json()
      targetUserId = body?.user_id ?? null
    } catch {
      // No body or invalid JSON — sync all users
    }

    // Read API config from admin_settings, fall back to env vars
    let apiUrl: string | null = null
    let apiKey: string | null = null

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', ['betting_api_url', 'betting_api_key'])

    if (settings && settings.length > 0) {
      for (const setting of settings) {
        if (setting.key === 'betting_api_url') apiUrl = setting.value
        if (setting.key === 'betting_api_key') apiKey = setting.value
      }
    }

    apiUrl = apiUrl || Deno.env.get('BETTING_SOFTWARE_API_URL') || null
    apiKey = apiKey || Deno.env.get('BETTING_SOFTWARE_API_KEY') || null

    if (!apiUrl || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Betting API configuration is missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch users to sync
    let query = supabase
      .from('user_profiles')
      .select('id, external_user_id')
      .not('external_user_id', 'is', null)

    if (targetUserId) {
      query = query.eq('id', targetUserId)
    } else {
      query = query.in('subscription_status', ['active', 'trial'])
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users to sync', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const results: { user_id: string; status: string; error?: string }[] = []

    for (const user of users) {
      try {
        // Call external betting API
        const response = await fetch(`${apiUrl}/balances/${user.external_user_id}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        })

        if (!response.ok) {
          results.push({ user_id: user.id, status: 'error', error: `API returned ${response.status}` })
          continue
        }

        const data: BalancesResponse = await response.json()

        let totalNetProfitWeek = 0

        // Update each bookmaker connection
        for (const account of data.accounts) {
          totalNetProfitWeek += account.net_profit_week

          // Update bookmaker_connections
          const { error: connError } = await supabase
            .from('bookmaker_connections')
            .update({
              balance: account.balance,
              net_profit_alltime: account.net_profit_alltime,
              net_profit_week: account.net_profit_week,
              last_synced_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('bookmaker', account.bookmaker)

          if (connError) {
            console.error(`Failed to update connection for ${user.id}/${account.bookmaker}: ${connError.message}`)
          }

          // Upsert betting_performance for current month
          const { error: perfError } = await supabase
            .from('betting_performance')
            .upsert(
              {
                user_id: user.id,
                month: currentMonth,
                bookmaker: account.bookmaker,
                net_profit: account.net_profit_alltime,
                bets_placed: account.bets_placed_week,
                last_bet_at: account.last_bet_at,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,month,bookmaker' }
            )

          if (perfError) {
            console.error(`Failed to upsert performance for ${user.id}/${account.bookmaker}: ${perfError.message}`)
          }
        }

        // Recalculate token_debt
        const grossProfit = totalNetProfitWeek
        const tokenDebt = grossProfit > 0 ? Math.floor(grossProfit * 0.30) : 0

        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ token_debt: tokenDebt })
          .eq('id', user.id)

        if (profileError) {
          console.error(`Failed to update token_debt for ${user.id}: ${profileError.message}`)
        }

        results.push({ user_id: user.id, status: 'synced' })
      } catch (err) {
        results.push({ user_id: user.id, status: 'error', error: (err as Error).message })
      }
    }

    return new Response(
      JSON.stringify({ synced: results.filter((r) => r.status === 'synced').length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
