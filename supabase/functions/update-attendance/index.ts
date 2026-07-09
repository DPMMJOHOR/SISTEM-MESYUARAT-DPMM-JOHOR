import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zod schema for attendance update validation
const attendanceSchema = z.object({
  id: z.number().optional(),
  mesyuarat_id: z.string().min(1, 'Meeting ID is required'),
  no_ahli: z.string().min(1, 'Member number is required'),
  status: z.enum(['Belum Dihubungi', 'Dihubungi', 'Sahkan Hadir', 'Hadir', 'Tidak Hadir', 'Batal']),
  catatan: z.string().optional(),
  dikemaskini_oleh: z.string().min(1, 'Updater is required'),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    
    // Validate input using Zod
    const validatedData = attendanceSchema.parse(body)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if attendance record exists
    const { data: existing } = await supabase
      .from('DPMM_KEHADIRAN')
      .select('id')
      .eq('mesyuarat_id', validatedData.mesyuarat_id)
      .eq('no_ahli', validatedData.no_ahli)
      .single()

    let result

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('DPMM_KEHADIRAN')
        .update({
          status: validatedData.status,
          catatan: validatedData.catatan || null,
          dikemaskini_oleh: validatedData.dikemaskini_oleh,
          dikemaskini_pada: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      result = data
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('DPMM_KEHADIRAN')
        .insert({
          mesyuarat_id: validatedData.mesyuarat_id,
          no_ahli: validatedData.no_ahli,
          status: validatedData.status,
          catatan: validatedData.catatan || null,
          dikemaskini_oleh: validatedData.dikemaskini_oleh,
          dikemaskini_pada: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      result = data
    }

    // Log the action
    await supabase.from('DPMM_AUDIT_LOG').insert({
      action: existing ? 'UPDATE' : 'CREATE',
      table_name: 'DPMM_KEHADIRAN',
      record_id: result.id.toString(),
      user_id: validatedData.dikemaskini_oleh,
      details: `${existing ? 'Updated' : 'Created'} attendance for member ${validatedData.no_ahli} in meeting ${validatedData.mesyuarat_id}`,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ success: true, data: result }),
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
