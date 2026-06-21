/**
 * seed-attendance Edge Function
 *
 * POST body: { mesyuarat_id: string }
 * Returns:   { seeded: number }
 *
 * Deploy:
 *   npx supabase login
 *   npx supabase link --project-ref lzoloupwtqmjyupvofhh
 *   npx supabase functions deploy seed-attendance --project-ref lzoloupwtqmjyupvofhh
 *
 * Add secret in Supabase Dashboard → Edge Functions → Manage Secrets:
 *   SUPABASE_SERVICE_ROLE_KEY = <service role key>
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!SERVICE_KEY) {
    return new Response(
      JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { mesyuarat_id } = await req.json();
    if (!mesyuarat_id) {
      return new Response(
        JSON.stringify({ error: 'mesyuarat_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key to bypass RLS and read cross-project member data
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: members, error: membersErr } = await admin
      .from('AHLI DPMM JOHOR')
      .select('NO_AHLI')
      .not('NO_AHLI', 'is', null);

    if (membersErr) throw membersErr;
    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ seeded: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    const records = members.map((m: { NO_AHLI: string }) => ({
      mesyuarat_id,
      no_ahli: m.NO_AHLI,
      status: 'Belum Dihubungi',
      dikemaskini_oleh: 'Sistem - Edge Function',
      dikemaskini_pada: now,
      created_at: now,
    }));

    // Batch upsert in chunks of 50
    for (let i = 0; i < records.length; i += 50) {
      const { error: upsertErr } = await admin
        .from('DPMM_KEHADIRAN')
        .upsert(records.slice(i, i + 50), { onConflict: 'mesyuarat_id,no_ahli' });
      if (upsertErr) throw upsertErr;
    }

    return new Response(
      JSON.stringify({ seeded: records.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
