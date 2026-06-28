// ============================================================
// CONTENT SECURITY POLICY (CSP)
// Add to index.html in both systems
// ============================================================

// ============================================================
// CSP META TAG
// ============================================================
/*
Add this to <head> section of index.html:

<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://lzoloupwtqmjyupvofhh.supabase.co https://api.groq.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
*/

// ============================================================
// CSP CONFIGURATION
// ============================================================
const CSP_CONFIG = {
  defaultSrc: "'self'",
  scriptSrc: "'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
  styleSrc: "'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  imgSrc: "'self' data: https:",
  fontSrc: "'self' https://fonts.gstatic.com",
  connectSrc: "'self' https://lzoloupwtqmjyupvofhh.supabase.co https://api.groq.com",
  frameSrc: "'none'",
  objectSrc: "'none'",
  baseUri: "'self'",
  formAction: "'self'"
};

// ============================================================
// GENERATE CSP HEADER
// ============================================================
function generateCSPHeader() {
  const directives = [];
  
  for (const [key, value] of Object.entries(CSP_CONFIG)) {
    const directiveName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    directives.push(`${directiveName} ${value}`);
  }
  
  return directives.join('; ');
}

// ============================================================
// VALIDATE CSP
// ============================================================
function validateCSP() {
  const cspHeader = generateCSPHeader();
  console.log('CSP Header:', cspHeader);
  
  // Check for unsafe directives
  const unsafeDirectives = ['unsafe-inline', 'unsafe-eval'];
  const hasUnsafe = unsafeDirectives.some(unsafe => cspHeader.includes(unsafe));
  
  if (hasUnsafe) {
    console.warn('⚠️  CSP contains unsafe directives. Consider removing them for better security.');
  } else {
    console.log('✅ CSP is secure');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  validateCSP();
  
  // Log CSP status
  console.log('ℹ️  CSP should be added as meta tag in HTML head');
  console.log('ℹ️  For server-side deployment, add CSP header to server config');
});
