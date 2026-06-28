// ============================================================
// SUBRESOURCE INTEGRITY (SRI)
// Add to index.html in both systems
// ============================================================

// ============================================================
// SRI GENERATION
// ============================================================
/*
To generate SRI hashes, use:

For SHA-256:
openssl dgst -sha256 -binary FILENAME | openssl base64 -A

For SHA-384:
openssl dgst -sha384 -binary FILENAME | openssl base64 -A

For SHA-512:
openssl dgst -sha512 -binary FILENAME | openssl base64 -A

Or use online tool: https://srihash.org/
*/

// ============================================================
// SRI VALIDATION
// ============================================================
function validateSRI() {
  const scripts = document.querySelectorAll('script[integrity]');
  const styles = document.querySelectorAll('link[integrity]');
  
  console.log(`✅ ${scripts.length} scripts with SRI`);
  console.log(`✅ ${styles.length} stylesheets with SRI`);
  
  // Check for external resources without SRI
  const externalScripts = document.querySelectorAll('script[src^="http"]');
  const externalWithoutSRI = Array.from(externalScripts).filter(s => !s.getAttribute('integrity'));
  
  if (externalWithoutSRI.length > 0) {
    console.warn(`⚠️  ${externalWithoutSRI.length} external scripts without SRI:`, externalWithoutSRI);
  } else {
    console.log('✅ All external scripts have SRI');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  validateSRI();
  
  console.log('ℹ️  Add SRI to all external scripts and stylesheets');
  console.log('ℹ️  Use openssl or srihash.org to generate hashes');
});
