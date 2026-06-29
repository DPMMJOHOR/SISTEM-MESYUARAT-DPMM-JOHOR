// Automated Reminder Scheduler
// Handles scheduling and management of event reminders

/**
 * Schedule a reminder for an event
 * @param {string} eventId - Event ID
 * @param {string} scheduledTime - ISO datetime string
 * @param {string} recipientFilter - 'all', 'non_responders', 'confirmed', 'custom'
 * @param {number} templateId - Template ID
 * @param {Array} blastChannels - Array of channels ['whatsapp', 'email']
 * @returns {Promise<Object>} - Created reminder
 */
async function scheduleReminder(eventId, scheduledTime, recipientFilter, templateId, blastChannels) {
  try {
    const { data, error } = await supabase
      .from('DPMM_REMINDERS')
      .insert({
        event_id: eventId,
        scheduled_time: scheduledTime,
        recipient_filter: recipientFilter,
        template_id: templateId,
        blast_channels: blastChannels,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast('✅ Peringatan berjaya dijadualkan!');
    return data;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    toast('❌ Gagal jadualkan peringatan: '+error.message,'err');
    throw error;
  }
}

/**
 * Load reminders for an event
 * @param {string} eventId - Event ID
 * @returns {Promise<Array>} - Array of reminders
 */
async function loadEventReminders(eventId) {
  try {
    const { data, error } = await supabase
      .from('DPMM_REMINDERS')
      .select('*, DPMM_TEMPLATES(nama)')
      .eq('event_id', eventId)
      .order('scheduled_time', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error loading reminders:', error);
    throw error;
  }
}

/**
 * Cancel a reminder
 * @param {number} reminderId - Reminder ID
 * @returns {Promise<void>}
 */
async function cancelReminder(reminderId) {
  try {
    const { error } = await supabase
      .from('DPMM_REMINDERS')
      .update({ status: 'cancelled' })
      .eq('id', reminderId);
    
    if (error) throw error;
    
    toast('✅ Peringatan dibatalkan!');
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    toast('❌ Gagal batalkan peringatan: '+error.message,'err');
    throw error;
  }
}

/**
 * Delete a reminder
 * @param {number} reminderId - Reminder ID
 * @returns {Promise<void>}
 */
async function deleteReminder(reminderId) {
  try {
    const { error } = await supabase
      .from('DPMM_REMINDERS')
      .delete()
      .eq('id', reminderId);
    
    if (error) throw error;
    
    toast('✅ Peringatan dipadam!');
  } catch (error) {
    console.error('Error deleting reminder:', error);
    toast('❌ Gagal padam peringatan: '+error.message,'err');
    throw error;
  }
}

/**
 * Render reminders list
 * @param {Array} reminders - Array of reminders
 * @param {string} containerId - Container element ID
 */
function renderRemindersList(reminders, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (reminders.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-faint);padding:2rem;">Tiada peringatan dijadualkan.</p>';
    return;
  }
  
  const statusColors = {
    scheduled: 'background:#FEF9C3;color:#A16207',
    sent: 'background:#DCFCE7;color:#15803D',
    failed: 'background:#FEE2E2;color:#B91C1C',
    cancelled: 'background:#F1F5F9;color:#64748B'
  };
  
  const statusLabels = {
    scheduled: 'Dijadualkan',
    sent: 'Terkirim',
    failed: 'Gagal',
    cancelled: 'Dibatalkan'
  };
  
  container.innerHTML = reminders.map(reminder => `
    <div class="card" style="padding:1rem;margin-bottom:.75rem;">
      <div style="display:flex;justify-content:space-between;align-items:start;">
        <div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem;">
            <span style="font-weight:700;color:var(--text-mid);">${formatDateTime(reminder.scheduled_time)}</span>
            <span style="font-size:.7rem;padding:.2rem .5rem;border-radius:999px;font-weight:600;${statusColors[reminder.status]}">${statusLabels[reminder.status]}</span>
          </div>
          <p style="font-size:.75rem;color:var(--text-soft);margin-bottom:.25rem;">
            Template: ${reminder.DPMM_TEMPLATES?.nama || 'Tiada'}
          </p>
          <p style="font-size:.75rem;color:var(--text-faint);">
            Penerima: ${reminder.recipient_filter === 'all' ? 'Semua' : reminder.recipient_filter === 'non_responders' ? 'Belum Respons' : reminder.recipient_filter}
          </p>
          ${reminder.sent_count ? `<p style="font-size:.7rem;color:var(--text-faint);">Dihantar: ${reminder.sent_count}</p>` : ''}
        </div>
        ${reminder.status === 'scheduled' ? `
          <div style="display:flex;gap:.4rem;">
            <button onclick="cancelReminder(${reminder.id}); loadEventReminders('${reminder.event_id}'); renderRemindersList(currentEventReminders, 'remindersList');" 
                    class="btn btn-white" style="padding:.3rem .6rem;font-size:.7rem;">Batal</button>
            <button onclick="deleteReminder(${reminder.id}); loadEventReminders('${reminder.event_id}'); renderRemindersList(currentEventReminders, 'remindersList');" 
                    class="btn btn-white" style="padding:.3rem .6rem;font-size:.7rem;color:var(--red);">Padam</button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Format datetime for display
 * @param {string} datetime - ISO datetime string
 * @returns {string} - Formatted datetime
 */
function formatDateTime(datetime) {
  if (!datetime) return '-';
  const date = new Date(datetime);
  return date.toLocaleString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Open reminder scheduling modal
 * @param {string} eventId - Event ID
 */
function openReminderModal(eventId) {
  const modal = document.getElementById('reminderModal');
  if (!modal) return;
  
  // Reset form
  document.getElementById('reminderEventId').value = eventId;
  document.getElementById('reminderScheduledTime').value = '';
  document.getElementById('reminderRecipientFilter').value = 'all';
  document.getElementById('reminderTemplate').value = '';
  document.getElementById('reminderBlastWA').checked = true;
  document.getElementById('reminderBlastEmail').checked = false;
  
  // Load templates
  loadReminderTemplates();
  
  modal.classList.remove('hidden');
}

/**
 * Load templates for reminder dropdown
 */
async function loadReminderTemplates() {
  try {
    const { data, error } = await supabase
      .from('DPMM_TEMPLATES')
      .select('id, nama')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const select = document.getElementById('reminderTemplate');
    select.innerHTML = '<option value="">-- Pilih Template --</option>' +
      (data || []).map(t => `<option value="${t.id}">${t.nama}</option>`).join('');
  } catch (error) {
    console.error('Error loading templates:', error);
  }
}

/**
 * Save reminder from modal
 */
async function saveReminderFromModal() {
  const eventId = document.getElementById('reminderEventId').value;
  const scheduledTime = document.getElementById('reminderScheduledTime').value;
  const recipientFilter = document.getElementById('reminderRecipientFilter').value;
  const templateId = document.getElementById('reminderTemplate').value;
  const blastWA = document.getElementById('reminderBlastWA').checked;
  const blastEmail = document.getElementById('reminderBlastEmail').checked;
  
  if (!eventId || !scheduledTime) {
    toast('⚠️ Sila isi tarikh dan masa peringatan.','err');
    return;
  }
  
  if (!templateId) {
    toast('⚠️ Sila pilih template peringatan.','err');
    return;
  }
  
  const blastChannels = [];
  if (blastWA) blastChannels.push('whatsapp');
  if (blastEmail) blastChannels.push('email');
  
  if (blastChannels.length === 0) {
    toast('⚠️ Sila pilih sekurang-kurangnya satu saluran.','err');
    return;
  }
  
  try {
    await scheduleReminder(
      eventId,
      new Date(scheduledTime).toISOString(),
      recipientFilter,
      templateId ? parseInt(templateId) : null,
      blastChannels
    );
    
    closeReminderModal();
    
    // Reload reminders if event is selected
    if (meeting) {
      const reminders = await loadEventReminders(meeting.mesyuarat_id);
      renderRemindersList(reminders, 'remindersList');
    }
  } catch (error) {
    console.error('Error saving reminder:', error);
  }
}

/**
 * Close reminder modal
 */
function closeReminderModal() {
  const modal = document.getElementById('reminderModal');
  if (modal) modal.classList.add('hidden');
}
