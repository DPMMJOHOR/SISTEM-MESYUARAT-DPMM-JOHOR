// Attendee QR Code Generator for Check-In
// Generates unique QR codes for confirmed attendees
// Updated for unified DPMM_RSVP schema

/**
 * Generate QR codes for all confirmed attendees of an event
 * @param {string} eventId - Event ID
 * @returns {Promise<Array>} - Array of QR codes with attendee info
 */
async function generateAttendeeQRCodes(eventId) {
  try {
    // Get confirmed attendees (status = 'Saya Hadir')
    const { data: rsvps, error } = await supabase
      .from('DPMM_RSVP')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'Saya Hadir');
    
    if (error) throw error;
    
    if (!rsvps || rsvps.length === 0) {
      return [];
    }
    
    const qrCodes = [];
    const baseUrl = window.location.origin + '/check-in.html';
    
    for (const rsvp of rsvps) {
      // Generate token on the fly (no storage in DB for security)
      const token = await generateAttendeeToken(rsvp.attendee_identifier, eventId);
      
      // Generate QR code
      const dataUrl = await generateAttendeeQRCode(eventId, token, baseUrl);
      
      // Get attendee name based on type
      let attendeeName = '';
      if (rsvp.attendee_type === 'member') {
        // Get member name from DPMM_USERS
        const { data: member } = await supabase
          .from('DPMM_USERS')
          .select('nama')
          .eq('no_ahli', rsvp.attendee_identifier)
          .single();
        attendeeName = member?.nama || rsvp.attendee_identifier;
      } else {
        // Get non-member name from DPMM_NON_MEMBER_CONTACTS
        const { data: contact } = await supabase
          .from('DPMM_NON_MEMBER_CONTACTS')
          .select('nama')
          .eq('id', rsvp.attendee_identifier)
          .single();
        attendeeName = contact?.nama || rsvp.attendee_identifier;
      }
      
      qrCodes.push({
        rsvpId: rsvp.id,
        attendeeIdentifier: rsvp.attendee_identifier,
        attendeeName: attendeeName,
        attendeeType: rsvp.attendee_type,
        token: token,
        dataUrl: dataUrl
      });
    }
    
    return qrCodes;
  } catch (error) {
    console.error('Error generating attendee QR codes:', error);
    throw error;
  }
}

/**
 * Generate QR code for a single attendee
 * @param {string} rsvpId - RSVP ID
 * @returns {Promise<Object>} - QR code data
 */
async function generateSingleAttendeeQR(rsvpId) {
  try {
    const { data: rsvp, error } = await supabase
      .from('DPMM_RSVP')
      .select('*')
      .eq('id', rsvpId)
      .single();
    
    if (error) throw error;
    
    // Generate token if not exists
    let token = rsvp.attendee_token;
    if (!token) {
      token = generateAttendeeToken(rsvp.user_id || rsvp.non_member_contact_id);
      
      await supabase
        .from('DPMM_RSVP')
        .update({ attendee_token: token })
        .eq('id', rsvpId);
    }
    
    const baseUrl = window.location.origin + '/check-in.html';
    const dataUrl = await generateAttendeeQRCode(rsvp.event_id, token, baseUrl);
    
    return {
      rsvpId: rsvp.id,
      attendeeId: rsvp.user_id || rsvp.non_member_contact_id,
      token: token,
      dataUrl: dataUrl
    };
  } catch (error) {
    console.error('Error generating single attendee QR code:', error);
    throw error;
  }
}

/**
 * Display attendee QR codes in a grid
 * @param {Array} qrCodes - Array of QR code objects
 * @param {string} containerId - Container element ID
 */
function displayAttendeeQRCodes(qrCodes, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (qrCodes.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-faint);padding:2rem;">Tiada peserta yang disahkan hadir.</p>';
    return;
  }
  
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;">
      ${qrCodes.map(qr => `
        <div class="card" style="padding:1rem;text-align:center;">
          <img src="${qr.dataUrl}" style="width:150px;height:150px;margin:0 auto .5rem;border:1px solid var(--border);border-radius:8px;">
          <p style="font-size:.8rem;font-weight:600;color:var(--text-mid);margin-bottom:.25rem;">${escapeHtml(qr.attendeeName)}</p>
          <p style="font-size:.7rem;color:var(--text-faint);">${qr.attendeeType === 'member' ? 'Ahli' : 'Hubungan Luar'}</p>
          <button onclick="downloadQRCode('${qr.dataUrl}', 'qr-${qr.attendeeName.replace(/[^a-zA-Z0-9]/g, '_')}.png')" 
                  class="btn btn-green" 
                  style="padding:.4rem .8rem;font-size:.75rem;margin-top:.5rem;">📥 Muat Turun</button>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Generate and display attendee QR codes for current event
 */
async function generateAndDisplayAttendeeQRCodes() {
  if (!meeting) {
    toast('⚠️ Sila pilih mesyuarat dahulu.','err');
    return;
  }
  
  try {
    const container = document.getElementById('attendeeQRCodeContainer');
    container.innerHTML = '<div class="spinner spinner-blue" style="margin:2rem auto;"></div><p style="text-align:center;color:var(--text-soft);">Menjana QR code peserta...</p>';
    
    const qrCodes = await generateAttendeeQRCodes(meeting.mesyuarat_id);
    displayAttendeeQRCodes(qrCodes, 'attendeeQRCodeContainer');
    
    toast(`✅ ${qrCodes.length} QR code peserta dijana!`);
  } catch (error) {
    console.error('Error generating attendee QR codes:', error);
    document.getElementById('attendeeQRCodeContainer').innerHTML = '<p style="text-align:center;color:var(--red);padding:2rem;">Ralat menjana QR code peserta</p>';
    toast('❌ Gagal menjana QR code: '+error.message,'err');
  }
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
