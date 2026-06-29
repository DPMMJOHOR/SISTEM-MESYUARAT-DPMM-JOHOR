// Non-Member Contacts Management
// Handles CRUD operations for DPMM_NON_MEMBER_CONTACTS table

let allNonMemberContacts = [];
let filteredNonMemberContacts = [];

/**
 * Validate contact data using centralized validation module
 */
function validateContact(contact) {
  const errors = [];
  
  // Validate nama
  const namaResult = Validation.validateText(contact.nama, 'Nama', 2, 100);
  if (!namaResult.valid) errors.push(namaResult.error);
  
  // Validate email
  const emailResult = Validation.validateEmail(contact.emel);
  if (!emailResult.valid) errors.push(emailResult.error);
  
  // Validate phone
  const phoneResult = Validation.validatePhone(contact.telefon);
  if (!phoneResult.valid) errors.push(phoneResult.error);
  
  // Check for SQL injection
  if (Validation.detectSQLInjection(contact.nama)) errors.push('Nama contains invalid characters');
  if (Validation.detectSQLInjection(contact.organization)) errors.push('Organization contains invalid characters');
  
  // Check for XSS
  if (Validation.detectXSS(contact.nama)) errors.push('Nama contains invalid characters');
  if (Validation.detectXSS(contact.organization)) errors.push('Organization contains invalid characters');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Load non-member contacts from Supabase
 */
async function loadNonMemberContacts() {
  try {
    const { data, error } = await supabase
      .from('DPMM_NON_MEMBER_CONTACTS')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    allNonMemberContacts = data || [];
    filteredNonMemberContacts = [...allNonMemberContacts];
    renderNonMemberContactsTable();
    updateNmcCount();
  } catch (error) {
    console.error('Error loading non-member contacts:', error);
    document.getElementById('nmcTbody').innerHTML = `
      <tr><td colspan="6" style="text-align:center;padding:3.5rem;color:var(--red);">
        <p>Ralat memuatkan data: ${error.message}</p>
      </td></tr>
    `;
  }
}

/**
 * Render non-member contacts table
 */
function renderNonMemberContactsTable() {
  const tbody = document.getElementById('nmcTbody');
  
  if (filteredNonMemberContacts.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;padding:3.5rem;color:var(--text-faint);">
        <p>Tiada hubungan luar.</p>
      </td></tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredNonMemberContacts.map((contact, index) => `
    <tr class="trow">
      <td style="padding:.625rem 1rem;text-align:center;font-size:.75rem;">${index + 1}</td>
      <td style="padding:.625rem 1rem;font-size:.85rem;font-weight:600;">${escapeHtml(contact.nama)}</td>
      <td style="padding:.625rem 1rem;font-size:.85rem;">${escapeHtml(contact.email)}</td>
      <td style="padding:.625rem 1rem;font-size:.85rem;">${escapeHtml(contact.phone)}</td>
      <td style="padding:.625rem 1rem;font-size:.85rem;">${escapeHtml(contact.organization || '-')}</td>
      <td style="padding:.625rem 1rem;text-align:center;">
        <button onclick="editNonMemberContact(${contact.id})" class="btn btn-ghost" style="padding:.4rem .6rem;font-size:.75rem;">✏️</button>
        <button onclick="deleteNonMemberContact(${contact.id})" class="btn btn-red" style="padding:.4rem .6rem;font-size:.75rem;">🗑️</button>
      </td>
    </tr>
  `).join('');
}

/**
 * Update contact count
 */
function updateNmcCount() {
  document.getElementById('nmcCount').textContent = `${allNonMemberContacts.length} hubungan`;
}

/**
 * Add single non-member contact
 */
async function addNonMemberContact() {
  const nama = document.getElementById('nmcNama').value.trim();
  const email = document.getElementById('nmcEmail').value.trim();
  const phone = document.getElementById('nmcPhone').value.trim();
  const organization = document.getElementById('nmcOrganization').value.trim();
  
  // Validation
  if (!nama || !email || !phone) {
    alert('Sila isi nama, emel dan no. telefon');
    return;
  }
  
  if (!isValidEmail(email)) {
    alert('Format emel tidak sah');
    return;
  }
  
  if (!isValidPhone(phone)) {
    alert('Format telefon tidak sah. Gunakan format: +60123456789');
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('DPMM_NON_MEMBER_CONTACTS')
      .insert({
        nama,
        email,
        phone,
        organization,
        created_by: currentUser.nama
      })
      .select();
    
    if (error) throw error;
    
    // Clear form
    document.getElementById('nmcNama').value = '';
    document.getElementById('nmcEmail').value = '';
    document.getElementById('nmcPhone').value = '';
    document.getElementById('nmcOrganization').value = '';
    
    // Reload data
    await loadNonMemberContacts();
    alert('Hubungan luar berjaya ditambah!');
  } catch (error) {
    console.error('Error adding contact:', error);
    alert('Ralat menambah hubungan: ' + error.message);
  }
}

/**
 * Upload non-member contacts from CSV/Excel
 */
async function uploadNonMemberContacts() {
  const fileInput = document.getElementById('nmcFileUpload');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Sila pilih fail untuk dimuat naik');
    return;
  }
  
  const statusDiv = document.getElementById('nmcUploadStatus');
  statusDiv.classList.remove('hidden');
  statusDiv.textContent = 'Memproses fail...';
  
  try {
    let contacts = [];
    
    // Parse file based on type
    if (file.name.endsWith('.csv')) {
      contacts = await parseCSV(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      contacts = await parseExcel(file);
    } else {
      throw new Error('Format fail tidak disokong. Gunakan .csv, .xlsx atau .xls');
    }
    
    if (contacts.length === 0) {
      throw new Error('Fail tiada data');
    }
    
    // Normalize field names (handle different column names)
    const normalizedContacts = contacts.map(c => ({
      nama: c.nama || c.Nama || c.name || c.Name || '',
      emel: c.emel || c.Emel || c.email || c.Email || '',
      telefon: c.telefon || c.Telefon || c.phone || c.Phone || c.no_hp || c.No_HP || '',
      organization: c.organization || c.Organization || c.organisasi || c.Organisasi || ''
    }));
    
    // Validate contacts
    const validContacts = [];
    const invalidContacts = [];
    
    for (const contact of normalizedContacts) {
      const validation = validateContact(contact);
      if (validation.valid) {
        validContacts.push(contact);
      } else {
        invalidContacts.push({ contact, errors: validation.errors });
      }
    }
    
    // Check for duplicates
    const duplicates = findDuplicates(validContacts, allNonMemberContacts);
    
    if (duplicates.length > 0) {
      alert(`${duplicates.length} hubungan adalah duplikat dan akan dilangkau.`);
    }
    
    // Filter out duplicates
    const uniqueContacts = validContacts.filter(c => 
      !duplicates.some(d => d.emel === c.emel || d.telefon === c.telefon)
    );
    
    if (uniqueContacts.length === 0) {
      throw new Error('Tiada hubungan baru untuk ditambah (semua adalah duplikat atau tidak sah)');
    }
    
    // Insert contacts
    const { data, error } = await supabase
      .from('DPMM_NON_MEMBER_CONTACTS')
      .insert(
        uniqueContacts.map(c => ({
          nama: c.nama,
          email: c.emel,
          phone: c.telefon,
          organization: c.organization,
          created_by: currentUser.nama
        }))
      )
      .select();
    
    if (error) throw error;
    
    // Reload data
    await loadNonMemberContacts();
    
    // Show success message
    statusDiv.style.background = '#DCFCE7';
    statusDiv.style.borderColor = '#86EFAC';
    statusDiv.style.color = '#15803D';
    statusDiv.textContent = `✅ Berjaya! ${uniqueContacts.length} hubungan ditambah. ${invalidContacts.length} tidak sah dilangkau.`;
    
    // Clear file input
    fileInput.value = '';
    
    // Show invalid contacts if any
    if (invalidContacts.length > 0) {
      console.log('Invalid contacts:', invalidContacts);
    }
    
  } catch (error) {
    console.error('Error uploading contacts:', error);
    statusDiv.style.background = '#FEF2F2';
    statusDiv.style.borderColor = '#FCA5A5';
    statusDiv.style.color = '#B91C1C';
    statusDiv.textContent = `❌ Ralat: ${error.message}`;
  }
}

/**
 * Edit non-member contact
 */
async function editNonMemberContact(id) {
  const contact = allNonMemberContacts.find(c => c.id === id);
  if (!contact) return;
  
  const newNama = prompt('Nama:', contact.nama);
  if (newNama === null) return;
  
  const newEmail = prompt('Emel:', contact.email);
  if (newEmail === null) return;
  
  const newPhone = prompt('No. Telefon:', contact.phone);
  if (newPhone === null) return;
  
  const newOrganization = prompt('Organisasi:', contact.organization || '');
  if (newOrganization === null) return;
  
  try {
    const { error } = await supabase
      .from('DPMM_NON_MEMBER_CONTACTS')
      .update({
        nama: newNama,
        email: newEmail,
        phone: newPhone,
        organization: newOrganization
      })
      .eq('id', id);
    
    if (error) throw error;
    
    await loadNonMemberContacts();
    alert('Hubungan berjaya dikemaskini!');
  } catch (error) {
    console.error('Error updating contact:', error);
    alert('Ralat mengemaskini hubungan: ' + error.message);
  }
}

/**
 * Delete non-member contact
 */
async function deleteNonMemberContact(id) {
  if (!confirm('Adakah anda pasti mahu memadam hubungan ini?')) return;
  
  try {
    const { error } = await supabase
      .from('DPMM_NON_MEMBER_CONTACTS')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    await loadNonMemberContacts();
    alert('Hubungan berjaya dipadam!');
  } catch (error) {
    console.error('Error deleting contact:', error);
    alert('Ralat memadam hubungan: ' + error.message);
  }
}

/**
 * Filter non-member contacts table
 */
function filterNmcTable() {
  const searchTerm = document.getElementById('srchNmc').value.toLowerCase();
  
  if (!searchTerm) {
    filteredNonMemberContacts = [...allNonMemberContacts];
  } else {
    filteredNonMemberContacts = allNonMemberContacts.filter(contact =>
      contact.nama.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm) ||
      (contact.organization && contact.organization.toLowerCase().includes(searchTerm))
    );
  }
  
  renderNonMemberContactsTable();
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

// Initialize when tab is shown
function initNonMemberContactsTab() {
  loadNonMemberContacts();
}
