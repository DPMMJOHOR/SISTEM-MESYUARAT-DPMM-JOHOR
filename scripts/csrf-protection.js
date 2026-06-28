// ============================================================
// CSRF PROTECTION
// Add this to index.html in both systems
// ============================================================

// ============================================================
// CSRF TOKEN GENERATION
// ============================================================
function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ============================================================
// CSRF TOKEN STORAGE
// ============================================================
function getCSRFToken() {
  return sessionStorage.getItem('csrf_token');
}

function setCSRFToken(token) {
  sessionStorage.setItem('csrf_token', token);
}

function initCSRFToken() {
  let token = getCSRFToken();
  if (!token) {
    token = generateCSRFToken();
    setCSRFToken(token);
  }
  return token;
}

// ============================================================
// CSRF TOKEN INJECTION
// ============================================================
function injectCSRFToken() {
  const token = initCSRFToken();
  
  // Add to all forms
  document.querySelectorAll('form').forEach(form => {
    let input = form.querySelector('input[name="csrf_token"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'csrf_token';
      input.value = token;
      form.appendChild(input);
    } else {
      input.value = token;
    }
  });
  
  // Add to all AJAX requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    options.headers = options.headers || {};
    options.headers['X-CSRF-Token'] = token;
    return originalFetch(url, options);
  };
}

// ============================================================
// CSRF VERIFICATION (Edge Function Side)
// ============================================================
/*
Add this to all Edge Functions:

function verifyCSRFToken(request: Request) {
  const token = request.headers.get('X-CSRF-Token');
  const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  // In production, verify token matches session
  // For now, just check token exists
  if (!token) {
    throw new Error('CSRF token missing');
  }
  
  return true;
}
*/

// ============================================================
// USAGE
// ============================================================

// Initialize CSRF protection on page load
document.addEventListener('DOMContentLoaded', () => {
  injectCSRFToken();
});

// For dynamic forms, call injectCSRFToken() after adding form to DOM
// For AJAX requests, the token is automatically added via fetch override
