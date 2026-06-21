/**
 * blast-runner.js — WAHA WhatsApp Blast Runner
 *
 * Reads Pending rows from DPMM_BLAST_QUEUE in Supabase and sends each
 * message via a local WAHA instance (http://localhost:3000).
 *
 * Prerequisites:
 *   docker run -d -p 3000:3000 -v waha_data:/app/.waha devlikeapro/waha
 *   Scan QR at http://localhost:3000 on first run.
 *
 * Setup:
 *   cd scripts && npm install
 *   Copy .env.example to .env and fill in values
 *   node blast-runner.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL  = 'https://lzoloupwtqmjyupvofhh.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_KEY;
const WAHA_URL      = process.env.WAHA_URL  || 'http://localhost:3000';
const WAHA_KEY      = process.env.WAHA_KEY  || 'waha';
const SESSION       = process.env.WAHA_SESSION || 'default';
const DELAY_MS      = parseInt(process.env.DELAY_MS || '2500', 10);

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_KEY not set in .env');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkWaha() {
  try {
    const resp = await fetch(`${WAHA_URL}/api/sessions/${SESSION}`, {
      headers: { 'X-Api-Key': WAHA_KEY }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    if (json.status !== 'WORKING') {
      console.error(`❌ WAHA session "${SESSION}" status: ${json.status}. Scan QR at ${WAHA_URL}`);
      process.exit(1);
    }
    console.log(`✅ WAHA session "${SESSION}" is WORKING.`);
  } catch (e) {
    console.error('❌ Cannot reach WAHA:', e.message);
    console.error(`   Is Docker running? Try: docker run -d -p 3000:3000 -v waha_data:/app/.waha devlikeapro/waha`);
    process.exit(1);
  }
}

async function sendMessage(phone, text) {
  const chatId = phone.startsWith('+') ? phone.slice(1) + '@c.us' : phone + '@c.us';
  const resp = await fetch(`${WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': WAHA_KEY },
    body: JSON.stringify({ session: SESSION, chatId, text })
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${body}`);
  }
  return await resp.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  await checkWaha();

  const { data: rows, error } = await db
    .from('DPMM_BLAST_QUEUE')
    .select('*')
    .eq('status', 'Pending')
    .order('id');

  if (error) { console.error('❌ Supabase error:', error.message); process.exit(1); }
  if (!rows || rows.length === 0) { console.log('ℹ️  No Pending messages in queue.'); return; }

  console.log(`📤 Sending ${rows.length} messages...`);

  let sent = 0, failed = 0, skipped = 0;

  for (const row of rows) {
    const phone = row.no_hp;
    if (!phone) {
      await db.from('DPMM_BLAST_QUEUE').update({ status: 'Skipped', catatan: 'Tiada nombor HP', sent_at: new Date().toISOString() }).eq('id', row.id);
      skipped++;
      continue;
    }

    try {
      await sendMessage(phone, row.teks_mesej);
      await db.from('DPMM_BLAST_QUEUE').update({ status: 'Sent', sent_at: new Date().toISOString() }).eq('id', row.id);
      console.log(`  ✅ [${row.id}] ${row.nama_ahli} (${phone})`);
      sent++;
    } catch (e) {
      await db.from('DPMM_BLAST_QUEUE').update({ status: 'Failed', catatan: e.message, sent_at: new Date().toISOString() }).eq('id', row.id);
      console.error(`  ❌ [${row.id}] ${row.nama_ahli} (${phone}): ${e.message}`);
      failed++;
    }

    if (rows.indexOf(row) < rows.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n📊 Done: ${sent} sent, ${failed} failed, ${skipped} skipped.`);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
