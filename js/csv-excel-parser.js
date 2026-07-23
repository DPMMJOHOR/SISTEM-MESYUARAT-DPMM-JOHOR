// CSV/Excel Parser for Non-Member Contacts
// Uses PapaParse for CSV and SheetJS (xlsx) for Excel

// Load PapaParse for CSV parsing
const papaparseScript = document.createElement('script');
papaparseScript.src = 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js';
papaparseScript.async = true;
document.head.appendChild(papaparseScript);

// Load SheetJS for Excel parsing
const xlsxScript = document.createElement('script');
xlsxScript.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
xlsxScript.async = true;
document.head.appendChild(xlsxScript);

/**
 * Parse CSV file
 * @param {File} file - CSV file to parse
 * @returns {Promise<Array>} - Parsed data
 */
function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Parse Excel file
 * @param {File} file - Excel file to parse
 * @returns {Promise<Array>} - Parsed data
 */
function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Convert to array of objects using first row as headers
        if (jsonData.length > 0) {
          const headers = jsonData[0];
          const rows = jsonData.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          resolve(rows);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate contact data using centralized validation module
 * @param {Object} contact - Contact object to validate
 * @returns {Object} - { valid: boolean, errors: Array }
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
 * Check for duplicate contacts
 * @param {Array} contacts - Contacts to check
 * @param {Array} existingContacts - Existing contacts in database
 * @returns {Array} - Array of duplicate contacts
 */
function findDuplicates(contacts, existingContacts) {
  const duplicates = [];
  const existingEmails = new Set(existingContacts.map(c => c.email));
  const existingPhones = new Set(existingContacts.map(c => c.phone));
  
  contacts.forEach(contact => {
    if (existingEmails.has(contact.emel) || existingPhones.has(contact.telefon)) {
      duplicates.push(contact);
    }
  });
  
  return duplicates;
}
