// Centralized validation module for Sistem Hebahan DPMM Johor
// Provides input validation functions to prevent injection attacks and data integrity issues

const Validation = {
  // Email validation using regex
  validateEmail: (email) => {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    if (email.length > 255) {
      return { valid: false, error: 'Email is too long (max 255 characters)' };
    }
    
    return { valid: true };
  },

  // Phone number validation (Malaysian format)
  validatePhone: (phone) => {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, error: 'Phone number is required' };
    }
    
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Malaysian phone format: 01X-XXXXXXX or 60X-XXXXXXXX
    const phoneRegex = /^(\+?6?01)[0-9]\d{7,8}$/;
    if (!phoneRegex.test(cleaned)) {
      return { valid: false, error: 'Invalid phone number format (e.g., 0123456789)' };
    }
    
    return { valid: true, cleaned };
  },

  // Text validation with length limits
  validateText: (text, fieldName, minLength = 1, maxLength = 255) => {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: `${fieldName} is required` };
    }
    
    if (text.length < minLength) {
      return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
    }
    
    if (text.length > maxLength) {
      return { valid: false, error: `${fieldName} is too long (max ${maxLength} characters)` };
    }
    
    return { valid: true };
  },

  // Sanitize HTML content to prevent XSS
  sanitizeHTML: (html) => {
    if (!html || typeof html !== 'string') {
      return '';
    }
    
    // Remove script tags and event handlers
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
    
    return sanitized;
  },

  // Validate required field
  validateRequired: (value, fieldName) => {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  },

  // Validate numeric field
  validateNumber: (value, fieldName, min = null, max = null) => {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: `${fieldName} is required` };
    }
    
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, error: `${fieldName} must be a number` };
    }
    
    if (min !== null && num < min) {
      return { valid: false, error: `${fieldName} must be at least ${min}` };
    }
    
    if (max !== null && num > max) {
      return { valid: false, error: `${fieldName} must be at most ${max}` };
    }
    
    return { valid: true };
  },

  // Validate date
  validateDate: (date, fieldName) => {
    if (!date) {
      return { valid: false, error: `${fieldName} is required` };
    }
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { valid: false, error: `${fieldName} must be a valid date` };
    }
    
    return { valid: true };
  },

  // Validate URL
  validateURL: (url, fieldName) => {
    if (!url) {
      return { valid: false, error: `${fieldName} is required` };
    }
    
    try {
      new URL(url);
      return { valid: true };
    } catch (e) {
      return { valid: false, error: `${fieldName} must be a valid URL` };
    }
  },

  // SQL injection detection
  detectSQLInjection: (input) => {
    if (!input || typeof input !== 'string') {
      return false;
    }
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|WHERE)\b)/i,
      /(--|;|\/\*|\*\/)/,
      /(\bOR\b|\bAND\b)/i,
      /(\b1=1\b|\b1=2\b)/i,
      /(\bTRUE\b|\bFALSE\b)/i,
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        return true;
      }
    }
    
    return false;
  },

  // XSS detection
  detectXSS: (input) => {
    if (!input || typeof input !== 'string') {
      return false;
    }
    
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        return true;
      }
    }
    
    return false;
  },

  // Comprehensive validation for user input
  validateInput: (input, rules) => {
    const errors = [];
    
    for (const rule of rules) {
      const result = rule.validator(input, rule.fieldName);
      if (!result.valid) {
        errors.push(result.error);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validation;
}
