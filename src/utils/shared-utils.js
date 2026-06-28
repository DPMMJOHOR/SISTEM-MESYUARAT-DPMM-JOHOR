// ============================================================
// SHARED UTILITY LIBRARY
// Common functions for both systems
// ============================================================

// ============================================================
// FORMATTING UTILITIES
// ============================================================

/**
 * Format Malaysian IC number
 * @param {string} ic - IC number
 * @returns {string} Formatted IC (xxxxxx-xx-xxxx)
 */
export function formatIC(ic) {
  if (!ic || ic.length !== 12) return ic;
  return `${ic.slice(0, 6)}-${ic.slice(6, 8)}-${ic.slice(8)}`;
}

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone (+60-xx-xxxxxxx)
 */
export function formatPhone(phone) {
  if (!phone) return phone;
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format Malaysian numbers
  if (digits.startsWith('60')) {
    return `+${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  }
  
  return phone;
}

/**
 * Format date to Malaysian format
 * @param {string|Date} date - Date
 * @returns {string} Formatted date (DD/MM/YYYY)
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format date time to Malaysian format
 * @param {string|Date} dateTime - Date time
 * @returns {string} Formatted date time (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(dateTime) {
  if (!dateTime) return '';
  
  const d = new Date(dateTime);
  const date = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${date} ${hours}:${minutes}`;
}

// ============================================================
// VALIDATION UTILITIES
// ============================================================

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Valid or not
 */
export function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

/**
 * Validate Malaysian IC number
 * @param {string} ic - IC number
 * @returns {boolean} Valid or not
 */
export function isValidIC(ic) {
  const regex = /^\d{6}-\d{2}-\d{4}$/;
  return regex.test(ic);
}

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Valid or not
 */
export function isValidPhone(phone) {
  const regex = /^(\+?60)?-?\d{2,3}-?\d{7,8}$/;
  return regex.test(phone);
}

// ============================================================
// STRING UTILITIES
// ============================================================

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Max length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

// ============================================================
// ARRAY UTILITIES
// ============================================================

/**
 * Remove duplicates from array
 * @param {Array} arr - Array
 * @returns {Array} Array without duplicates
 */
export function unique(arr) {
  return [...new Set(arr)];
}

/**
 * Sort array by key
 * @param {Array} arr - Array to sort
 * @param {string} key - Key to sort by
 * @returns {Array} Sorted array
 */
export function sortBy(arr, key) {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });
}

/**
 * Filter array by condition
 * @param {Array} arr - Array to filter
 * @param {Function} predicate - Filter condition
 * @returns {Array} Filtered array
 */
export function filterBy(arr, predicate) {
  return arr.filter(predicate);
}

// ============================================================
// OBJECT UTILITIES
// ============================================================

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function merge(target, source) {
  return { ...target, ...source };
}

/**
 * Get nested object property
 * @param {Object} obj - Object
 * @param {string} path - Dot notation path
 * @returns {*} Property value
 */
export function get(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// ============================================================
// STORAGE UTILITIES
// ============================================================

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @returns {*} Stored value
 */
export function getStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return localStorage.getItem(key);
  }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    localStorage.setItem(key, value);
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export function removeStorage(key) {
  localStorage.removeItem(key);
}

/**
 * Clear all localStorage
 */
export function clearStorage() {
  localStorage.clear();
}

// ============================================================
// EXPORT ALL UTILITIES
// ============================================================
export default {
  formatIC,
  formatPhone,
  formatDate,
  formatDateTime,
  isValidEmail,
  isValidIC,
  isValidPhone,
  truncate,
  capitalize,
  toTitleCase,
  unique,
  sortBy,
  filterBy,
  deepClone,
  merge,
  get,
  getStorage,
  setStorage,
  removeStorage,
  clearStorage
};
