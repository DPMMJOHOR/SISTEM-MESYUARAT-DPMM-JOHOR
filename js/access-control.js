// Multi-Bureau Access Control
// Handles bureau assignment and access control for users and events

const BUREAU_OPTIONS = [
  'Biro Professional',
  'Biro Kontraktor',
  'Biro International Trade'
];

/**
 * Check if current user is super admin
 * @returns {boolean}
 */
function isSuperAdmin() {
  return user && user.role === 'super_admin';
}

/**
 * Get current user's bureau
 * @returns {string|null}
 */
function getUserBureau() {
  return user ? user.bureau : null;
}

/**
 * Check if user can access a specific bureau
 * @param {string} bureau - Bureau to check
 * @returns {boolean}
 */
function canAccessBureau(bureau) {
  if (isSuperAdmin()) return true;
  return getUserBureau() === bureau || bureau === null;
}

/**
 * Filter events by user's bureau access
 * @param {Array} events - Array of events
 * @returns {Array} - Filtered events
 */
function filterEventsByBureau(events) {
  if (isSuperAdmin()) return events;
  
  const userBureau = getUserBureau();
  if (!userBureau) return events.filter(e => !e.bureau);
  
  return events.filter(e => e.bureau === userBureau || !e.bureau);
}

/**
 * Filter non-member contacts by user's bureau access
 * @param {Array} contacts - Array of contacts
 * @returns {Array} - Filtered contacts
 */
function filterContactsByBureau(contacts) {
  if (isSuperAdmin()) return contacts;
  
  const userBureau = getUserBureau();
  if (!userBureau) return contacts.filter(c => !c.bureau);
  
  return contacts.filter(c => c.bureau === userBureau || !c.bureau);
}

/**
 * Get bureau options for dropdown
 * @returns {Array} - Bureau options
 */
function getBureauOptions() {
  return BUREAU_OPTIONS;
}

/**
 * Render bureau dropdown
 * @param {string} elementId - Element ID
 * @param {string} selectedValue - Currently selected value
 */
function renderBureauDropdown(elementId, selectedValue = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.innerHTML = `
    <option value="">-- Tiada Biro --</option>
    ${BUREAU_OPTIONS.map(bureau => `
      <option value="${bureau}" ${bureau === selectedValue ? 'selected' : ''}>${bureau}</option>
    `).join('')}
  `;
}

/**
 * Update user bureau assignment
 * @param {string} userId - User ID
 * @param {string} bureau - Bureau to assign
 * @returns {Promise<void>}
 */
async function updateUserBureau(userId, bureau) {
  try {
    const { error } = await supabase
      .from('DPMM_USERS')
      .update({ bureau: bureau || null })
      .eq('user_id', userId);
    
    if (error) throw error;
    
    toast('✅ Biro berjaya dikemaskini!');
  } catch (error) {
    console.error('Error updating user bureau:', error);
    toast('❌ Gagal kemaskini biro: '+error.message,'err');
    throw error;
  }
}

/**
 * Load user bureau data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data with bureau
 */
async function loadUserBureau(userId) {
  try {
    const { data, error } = await supabase
      .from('DPMM_USERS')
      .select('bureau')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error loading user bureau:', error);
    throw error;
  }
}

/**
 * Add bureau filter to event list
 */
function addBureauFilterToEventList() {
  const container = document.getElementById('eventFilters');
  if (!container) return;
  
  const bureauFilter = document.createElement('div');
  bureauFilter.innerHTML = `
    <select id="bureauFilter" onchange="filterEventsByBureauSelection()" class="inp" style="width:auto;">
      <option value="">Semua Biro</option>
      ${BUREAU_OPTIONS.map(bureau => `
        <option value="${bureau}">${bureau}</option>
      `).join('')}
    </select>
  `;
  
  container.appendChild(bureauFilter);
}

/**
 * Filter events by bureau selection
 */
function filterEventsByBureauSelection() {
  const selectedBureau = document.getElementById('bureauFilter').value;
  // This would be called when rendering the event list
  // Implementation depends on how events are currently filtered
  console.log('Filtering by bureau:', selectedBureau);
}

/**
 * Check if user can create event for specific bureau
 * @param {string} bureau - Bureau to check
 * @returns {boolean}
 */
function canCreateEventForBureau(bureau) {
  if (isSuperAdmin()) return true;
  return getUserBureau() === bureau || bureau === null;
}

/**
 * Validate bureau access before event creation
 * @param {string} bureau - Bureau to validate
 * @returns {boolean}
 */
function validateBureauAccess(bureau) {
  if (!canCreateEventForBureau(bureau)) {
    toast('⚠️ Anda tidak mempunyai akses untuk mencipta acara untuk biro ini.','err');
    return false;
  }
  return true;
}
