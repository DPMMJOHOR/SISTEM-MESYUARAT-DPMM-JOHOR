import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zod schema for WhatsApp blast queue operations
const blastSchema = z.object({
  action: z.enum(['create', 'update', 'delete']),
  mesyuarat_id: z.string().min(1, 'Meeting ID is required'),
  no_ahli: z.string().optional(),
  nama_ahli: z.string().optional(),
  no_hp: z.string().optional(),
  teks_mesej: z.string().min(1, 'Message is required'),
  status: z.enum(['Pending', 'Sent', 'Failed', 'Skipped']).default('Pending'),
  dibuat_oleh: z.string().min(1, 'Creator is required'),
  id: z.number().optional(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    
    // Validate input using Zod
    const validatedData = blastSchema.parse(body)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let result

    if (validatedData.action === 'create') {
      // Create new blast queue entry
      const { data, error } = await supabase
        .from('DPMM_BLAST_QUEUE')
        .insert({
          mesyuarat_id: validatedData.mesyuarat_id,
          no_ahli: validatedData.no_ahli || null,
          nama_ahli: validatedData.nama_ahli || null,
          no_hp: validatedData.no_hp || null,
          teks_mesej: validatedData.teks_mesej,
          status: validatedData.status,
          dibuat_oleh: validatedData.dibuat_oleh,
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

    } else if (validatedData.action === 'update') {
      // Update existing blast queue entry
      if (!validatedData.id) {
        return new Response(
          JSON.stringify({ error: 'ID is required for update action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('DPMM_BLAST_QUEUE')
        .update({
          status: validatedData.status,
          sent_at: validatedData.status === 'Sent' ? new Date().toISOString() : null,
          catatan: validatedData.status === 'Failed' ? 'Failed to send' : null,
        })
        .eq('id', validatedData.id)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      result = data

    } else if (validatedData.action === 'delete') {
      // Delete blast queue entry
      if (!validatedData.id) {
        return new Response(
          JSON.stringify({ error: 'ID is required for delete action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabase
        .from('DPMM_BLAST_QUEUE')
        .delete()
        .eq('id', validatedData.id)

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      result = { deleted: true }
    }

    // Log the action
    await supabase.from('DPMM_AUDIT_LOG').insert({
      action: validatedData.action.toUpperCase(),
      table_name: 'DPMM_BLAST_QUEUE',
      record_id: result.id?.toString() || 'batch',
      user_id: validatedData.dibuat_oleh,
      details: `${validatedData.action} WhatsApp blast for meeting ${validatedData.mesyuarat_id}`,
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
