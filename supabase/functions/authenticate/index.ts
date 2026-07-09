import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, password } = await req.json()

    // Validate input
    if (!user_id || !password) {
      return new Response(
        JSON.stringify({ error: 'user_id and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch user with password hash
    const { data: user, error: fetchError } = await supabase
      .from('DPMM_USERS')
      .select('user_id, nama, peranan, aktif, kata_laluan_hash, password_migrated, kata_laluan')
      .eq('user_id', user_id)
      .single()

    if (fetchError || !user) {
      return new Response(
        JSON.stringify({ error: 'ID pengguna tidak dijumpai' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user.aktif) {
      return new Response(
        JSON.stringify({ error: 'Akaun tidak aktif. Hubungi pentadbir.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify password using bcrypt
    let passwordValid = false
    
    if (user.kata_laluan_hash && user.password_migrated) {
      // User has migrated to hashed password
      const bcrypt = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts')
      passwordValid = await bcrypt.compare(password, user.kata_laluan_hash)
    } else if (user.kata_laluan) {
      // User still has plaintext password (fallback during migration)
      passwordValid = (user.kata_laluan === password)
    } else {
      return new Response(
        JSON.stringify({ error: 'Kata laluan tidak betul.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: 'Kata laluan tidak betul.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log successful login
    await supabase.from('DPMM_AUDIT_LOG').insert({
      action: 'LOGIN',
      table_name: 'DPMM_USERS',
      record_id: user.user_id,
      user_id: user.user_id,
      details: 'User logged in via Edge Function',
      created_at: new Date().toISOString()
    })

    // Return user data (excluding password)
    const { data: userData } = await supabase
      .from('DPMM_USERS')
      .select('user_id, nama, peranan')
      .eq('user_id', user_id)
      .single()

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
