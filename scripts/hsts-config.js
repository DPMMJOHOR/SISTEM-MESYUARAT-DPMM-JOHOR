// ============================================================
// HTTPS ENFORCEMENT WITH HSTS
// Add to index.html in both systems
// ============================================================

// ============================================================
// HTTPS ENFORCEMENT
// ============================================================
function enforceHTTPS() {
  // Check if current protocol is HTTP
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    // Redirect to HTTPS
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
  }
}

// ============================================================
// HSTS HEADER (Server-Side)
// ============================================================
/*
Add this to your server configuration or GitHub Pages settings:

For Nginx:
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

For Apache:
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

For GitHub Pages:
HSTS is automatically enabled for custom domains.
For github.io domains, HSTS is managed by GitHub.
*/

// ============================================================
// HSTS CONFIGURATION
// ============================================================
const HSTS_CONFIG = {
  maxAge: 31536000, // 1 year in seconds
  includeSubDomains: true,
  preload: true
};

// ============================================================
// HSTS STATUS CHECK
// ============================================================
function checkHSTSStatus() {
  if (location.protocol === 'https:') {
    console.log('✅ HTTPS enforced');
    
    // Check if HSTS is active (browser-managed)
    // Note: HSTS status is browser-managed and cannot be checked via JavaScript
    console.log('ℹ️  HSTS status is managed by browser');
  } else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('ℹ️  HTTP allowed for localhost');
  } else {
    console.warn('⚠️  HTTP detected - should be HTTPS');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  enforceHTTPS();
  checkHSTSStatus();
});
