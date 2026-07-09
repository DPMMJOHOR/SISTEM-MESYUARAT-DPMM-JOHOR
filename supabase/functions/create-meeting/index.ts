import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zod schema for meeting creation validation
const meetingSchema = z.object({
  mesyuarat_id: z.string().min(1, 'Meeting ID is required'),
  nama: z.string().min(1, 'Meeting name is required'),
  tarikh: z.string().optional(),
  tempat: z.string().optional(),
  gdrive_folder_id: z.string().optional(),
  gdrive_folder_url: z.string().optional(),
  aktif: z.boolean().default(false),
  dibuat_oleh: z.string().min(1, 'Creator is required'),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    
    // Validate input using Zod
    const validatedData = meetingSchema.parse(body)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if meeting already exists
    const { data: existing } = await supabase
      .from('DPMM_MESYUARAT')
      .select('mesyuarat_id')
      .eq('mesyuarat_id', validatedData.mesyuarat_id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Meeting ID already exists' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create meeting
    const { data, error } = await supabase
      .from('DPMM_MESYUARAT')
      .insert({
        mesyuarat_id: validatedData.mesyuarat_id,
        nama: validatedData.nama,
        tarikh: validatedData.tarikh || null,
        tempat: validatedData.tempat || null,
        gdrive_folder_id: validatedData.gdrive_folder_id || null,
        gdrive_folder_url: validatedData.gdrive_folder_url || null,
        aktif: validatedData.aktif,
        dibuat_oleh: validatedData.dibuat_oleh,
        dibuat_pada: new Date().toISOString(),
        dikemaskini_pada: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the action
    await supabase.from('DPMM_AUDIT_LOG').insert({
      action: 'CREATE',
      table_name: 'DPMM_MESYUARAT',
      record_id: data.mesyuarat_id,
      user_id: validatedData.dibuat_oleh,
      details: `Created meeting: ${validatedData.nama}`,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
