/**
 * meeting-reminder.js — Email Reminder for Upcoming Meetings
 *
 * Checks DPMM_MESYUARAT for meetings scheduled in the next 3 days and sends
 * a summary email via Gmail. Runs as a GitHub Actions cron job.
 *
 * Environment variables (set as GitHub Secrets):
 *   SUPABASE_URL, SUPABASE_KEY, GMAIL_USER, GMAIL_PASS, ADMIN_EMAIL
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lzoloupwtqmjyupvofhh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GMAIL_USER   = process.env.GMAIL_USER;
const GMAIL_PASS   = process.env.GMAIL_PASS;
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL;
const DAYS_AHEAD   = parseInt(process.env.DAYS_AHEAD || '3', 10);

const REQUIRED = { SUPABASE_KEY, GMAIL_USER, GMAIL_PASS, ADMIN_EMAIL };
const missing = Object.entries(REQUIRED).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('❌ Missing env vars:', missing.join(', '));
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

function fmtDate(d) {
  return new Date(d).toLocaleDateString('ms-MY', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

async function run() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + DAYS_AHEAD);

  const { data: meetings, error } = await db
    .from('DPMM_MESYUARAT')
    .select('mesyuarat_id,nama,tarikh,tempat')
    .gte('tarikh', today.toISOString().slice(0, 10))
    .lte('tarikh', cutoff.toISOString().slice(0, 10))
    .order('tarikh');

  if (error) { console.error('❌ Supabase error:', error.message); process.exit(1); }
  if (!meetings || meetings.length === 0) {
    console.log(`ℹ️  No meetings in the next ${DAYS_AHEAD} days. No email sent.`);
    return;
  }

  console.log(`📅 Found ${meetings.length} upcoming meeting(s). Sending reminder...`);

  const rows = meetings.map(m =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#1E3A8A;">${m.mesyuarat_id}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${m.nama}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${m.tarikh ? fmtDate(m.tarikh) : '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${m.tempat || '—'}</td>
    </tr>`
  ).join('');

  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:20px 24px;border-radius:12px 12px 0 0;">
    <h2 style="color:#fff;margin:0;font-size:18px;">📅 Peringatan Mesyuarat DPMM Johor</h2>
    <p style="color:rgba(255,255,255,.8);margin:4px 0 0;font-size:13px;">Mesyuarat dalam ${DAYS_AHEAD} hari akan datang</p>
  </div>
  <div style="background:#f8fafc;padding:20px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#1E3A8A;">
          <th style="padding:8px 12px;text-align:left;color:#fff;font-weight:700;">ID</th>
          <th style="padding:8px 12px;text-align:left;color:#fff;font-weight:700;">Nama Mesyuarat</th>
          <th style="padding:8px 12px;text-align:left;color:#fff;font-weight:700;">Tarikh</th>
          <th style="padding:8px 12px;text-align:left;color:#fff;font-weight:700;">Tempat</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:12px;color:#94a3b8;margin-top:16px;">
      Dijanakan oleh Sistem Pengurusan Mesyuarat DPMM Negeri Johor &mdash; dihantar secara automatik.
    </p>
  </div>
</body></html>`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS }
  });

  await transporter.sendMail({
    from: `"Sistem Mesyuarat DPMM" <${GMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `[DPMM] Peringatan: ${meetings.length} mesyuarat dalam ${DAYS_AHEAD} hari`,
    html
  });

  console.log(`✅ Reminder sent to ${ADMIN_EMAIL} for ${meetings.length} meeting(s).`);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
