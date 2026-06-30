// RSVP Tracking System
// Handles unified RSVP for members (WhatsApp) and non-members (Email)
// Updated for unified schema (DPMM_RSVP table)

let allRSVPs = [];
let currentEventRSVPs = [];

/**
 * Load RSVPs for current event
 */
async function loadEventRSVPs(eventId) {
  try {
    const { data, error } = await supabase
      .from('DPMM_RSVP')
      .select('*')
      .eq('event_id', eventId)
      .order('response_timestamp', { ascending: false, nullsLast: true });
    
    if (error) throw error;
    
    currentEventRSVPs = data || [];
    renderRSVPDashboard();
  } catch (error) {
    console.error('Error loading RSVPs:', error);
  }
}

/**
 * Render RSVP dashboard
 */
function renderRSVPDashboard() {
  const container = document.getElementById('rsvpDashboard');
  if (!container) return;
  
  // Calculate statistics (using unified status values)
  const stats = {
    confirmed: currentEventRSVPs.filter(r => r.status === 'Saya Hadir').length,
    declined: currentEventRSVPs.filter(r => r.status === 'Saya Tidak Hadir').length,
    tentative: currentEventRSVPs.filter(r => r.status === 'Tidak Pasti').length,
    pending: currentEventRSVPs.filter(r => r.status === 'Belum Dihubungi').length,
    total: currentEventRSVPs.length
  };
  
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem;">
      <div class="card kpi-card kpi-green" style="padding:1.25rem;">
        <div style="font-size:2rem;font-weight:700;color:#16A34A;">${stats.confirmed}</div>
        <div style="font-size:.75rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:1px;font-weight:700;">Saya Hadir</div>
      </div>
      <div class="card kpi-card kpi-red" style="padding:1.25rem;">
        <div style="font-size:2rem;font-weight:700;color:#EF4444;">${stats.declined}</div>
        <div style="font-size:.75rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:1px;font-weight:700;">Saya Tidak Hadir</div>
      </div>
      <div class="card kpi-card kpi-amber" style="padding:1.25rem;">
        <div style="font-size:2rem;font-weight:700;color:#F59E0B;">${stats.tentative}</div>
        <div style="font-size:.75rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:1px;font-weight:700;">Tidak Pasti</div>
      </div>
      <div class="card kpi-card kpi-slate" style="padding:1.25rem;">
        <div style="font-size:2rem;font-weight:700;color:#94A3B8;">${stats.pending}</div>
        <div style="font-size:.75rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:1px;font-weight:700;">Belum Dihubungi</div>
      </div>
    </div>
    
    <div class="card" style="padding:1.5rem;">
      <h3 style="font-family:'Outfit',sans-serif;font-size:1.05rem;font-weight:700;color:var(--blue-dark);margin-bottom:1.25rem;">Senarai RSVP</h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--blue-dark);">
              <th style="padding:.625rem 1rem;text-align:left;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,0.85);">ID Peserta</th>
              <th style="padding:.625rem 1rem;text-align:left;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Jenis</th>
              <th style="padding:.625rem 1rem;text-align:left;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Saluran</th>
              <th style="padding:.625rem 1rem;text-align:left;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Status</th>
              <th style="padding:.625rem 1rem;text-align:left;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Tarikh Respons</th>
              <th style="padding:.625rem 1rem;text-align:left;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Check-in</th>
            </tr>
          </thead>
          <tbody>
            ${currentEventRSVPs.length === 0 ? 
              '<tr><td colspan="6" style="text-align:center;padding:3.5rem;color:var(--text-faint);">Tiada RSVP lagi.</td></tr>' :
              currentEventRSVPs.map(rsvp => `
                <tr class="trow">
                  <td style="padding:.625rem 1rem;font-size:.85rem;font-weight:600;">${escapeHtml(rsvp.attendee_identifier)}</td>
                  <td style="padding:.625rem 1rem;font-size:.85rem;">${rsvp.attendee_type === 'member' ? 'Ahli' : 'Hubungan Luar'}</td>
                  <td style="padding:.625rem 1rem;font-size:.85rem;">${rsvp.channel === 'WhatsApp' ? '💬 WhatsApp' : '📧 Emel'}</td>
                  <td style="padding:.625rem 1rem;">
                    <span class="${rsvp.status === 'Saya Hadir' ? 'badge-hadir' : rsvp.status === 'Saya Tidak Hadir' ? 'badge-tidak' : rsvp.status === 'Tidak Pasti' ? 'badge-belum' : 'badge-lain'}" style="font-size:.68rem;padding:.2rem .5rem;border-radius:999px;font-weight:700;">
                      ${rsvp.status}
                    </span>
                  </td>
                  <td style="padding:.625rem 1rem;font-size:.75rem;color:var(--text-soft);">${rsvp.response_timestamp ? formatDate(rsvp.response_timestamp) : '-'}</td>
                  <td style="padding:.625rem 1rem;font-size:.85rem;">
                    ${rsvp.checked_in ? 
                      '<span style="color:#16A34A;font-weight:700;">✓ Check-in</span>' : 
                      '<span style="color:var(--text-faint);">-</span>'}
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Create RSVP record for member
 */
async function createMemberRSVP(eventId, memberId, status, channel = 'WhatsApp') {
  // Validate status
  const validStatuses = ['Saya Hadir', 'Saya Tidak Hadir', 'Tidak Pasti', 'Belum Dihubungi'];
  if (!validStatuses.includes(status)) {
    throw new Error('Status tidak sah');
  }
  
  try {
    const { data, error } = await supabase
      .from('DPMM_RSVP')
      .upsert({
        event_id: eventId,
        attendee_type: 'member',
        attendee_identifier: memberId,
        status: status,
        channel: channel,
        response_timestamp: new Date().toISOString()
      }, {
        onConflict: 'event_id,attendee_identifier'
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating RSVP:', error);
    throw error;
  }
}

/**
 * Create RSVP record for non-member
 */
async function createNonMemberRSVP(eventId, contactId, status, channel = 'Email') {
  // Validate status
  const validStatuses = ['Saya Hadir', 'Saya Tidak Hadir', 'Tidak Pasti', 'Belum Dihubungi'];
  if (!validStatuses.includes(status)) {
    throw new Error('Status tidak sah');
  }
  
  try {
    const { data, error } = await supabase
      .from('DPMM_RSVP')
      .upsert({
        event_id: eventId,
        attendee_type: 'non-member',
        attendee_identifier: contactId,
        status: status,
        channel: channel,
        response_timestamp: new Date().toISOString()
      }, {
        onConflict: 'event_id,attendee_identifier'
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating RSVP:', error);
    throw error;
  }
}

/**
 * Send RSVP confirmation
 */
async function sendRSVPConfirmation(rsvp) {
  // Send confirmation via original channel
  if (rsvp.channel === 'whatsapp') {
    // Send WhatsApp confirmation via WAHA
    await sendWhatsAppConfirmation(rsvp);
  } else if (rsvp.channel === 'email') {
    // Send Email confirmation via Resend
    await sendEmailConfirmation(rsvp);
  }
}

/**
 * Send WhatsApp confirmation
 */
async function sendWhatsAppConfirmation(rsvp) {
  // This would integrate with WAHA to send confirmation message
  console.log('Sending WhatsApp confirmation to:', rsvp.attendee_name);
  // Implementation would call WAHA API
}

/**
 * Send Email confirmation
 */
async function sendEmailConfirmation(rsvp) {
  // This would integrate with Resend to send confirmation email
  console.log('Sending Email confirmation to:', rsvp.attendee_name);
  // Implementation would call Resend API
}

/**
 * Check RSVP deadline and send reminders
 */
async function checkRSVPDeadline(eventId, deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  if (now > deadlineDate) {
    // Deadline passed, send reminders to non-responders
    const nonResponders = currentEventRSVPs.filter(r => r.status === 'pending');
    
    for (const rsvp of nonResponders) {
      if (rsvp.channel === 'whatsapp') {
        await sendWhatsAppReminder(rsvp);
      } else if (rsvp.channel === 'email') {
        await sendEmailReminder(rsvp);
      }
    }
  }
}

/**
 * Send WhatsApp reminder
 */
async function sendWhatsAppReminder(rsvp) {
  console.log('Sending WhatsApp reminder to:', rsvp.attendee_name);
  // Implementation would call WAHA API
}

/**
 * Send Email reminder
 */
async function sendEmailReminder(rsvp) {
  console.log('Sending Email reminder to:', rsvp.attendee_name);
  // Implementation would call Resend API
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
