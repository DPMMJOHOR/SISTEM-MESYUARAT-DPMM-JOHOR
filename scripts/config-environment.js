// ============================================================
// ENVIRONMENT CONFIGURATION
// Move hardcoded URLs to environment variables
// ============================================================

// ============================================================
// CONFIGURATION OBJECT
// ============================================================
const CONFIG = {
  // Supabase
  SUPABASE_URL: window.SUPABASE_URL || 'https://lzoloupwtqmjyupvofhh.supabase.co',
  SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || '',
  
  // WhatsApp (Twilio)
  WHATSAPP_API_URL: window.WHATSAPP_API_URL || 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/whatsapp-blast',
  
  // Groq (via Edge Function)
  GROQ_API_URL: window.GROQ_API_URL || 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/groq-chatbot',
  
  // Edge Functions
  EDGE_FUNCTION_BASE: window.EDGE_FUNCTION_BASE || 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1',
  
  // Meeting System
  MEETING_SYSTEM_URL: window.MEETING_SYSTEM_URL || 'https://dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR',
  
  // Member System
  MEMBER_SYSTEM_URL: window.MEMBER_SYSTEM_URL || 'https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR',
  
  // Environment
  ENVIRONMENT: window.ENVIRONMENT || 'production',
  
  // Feature Flags
  FEATURES: {
    ENABLE_CHATBOT: window.ENABLE_CHATBOT !== false,
    ENABLE_WHATSAPP: window.ENABLE_WHATSAPP !== false,
    ENABLE_BLAST: window.ENABLE_BLAST !== false,
    DEBUG_MODE: window.DEBUG_MODE === true
  }
};

// ============================================================
// CONFIGURATION VALIDATION
// ============================================================
function validateConfig() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !CONFIG[key]);
  
  if (missing.length > 0) {
    console.error('Missing configuration:', missing);
    if (CONFIG.FEATURES.DEBUG_MODE) {
      alert('Konfigurasi tidak lengkap: ' + missing.join(', '));
    }
    return false;
  }
  
  return true;
}

// ============================================================
// GET CONFIG VALUE
// ============================================================
function getConfig(key, defaultValue = null) {
  return CONFIG[key] || defaultValue;
}

// ============================================================
// IS PRODUCTION
// ============================================================
function isProduction() {
  return CONFIG.ENVIRONMENT === 'production';
}

// ============================================================
// IS DEVELOPMENT
// ============================================================
function isDevelopment() {
  return CONFIG.ENVIRONMENT === 'development';
}

// ============================================================
// IS STAGING
// ============================================================
function isStaging() {
  return CONFIG.ENVIRONMENT === 'staging';
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  validateConfig();
  
  if (CONFIG.FEATURES.DEBUG_MODE) {
    console.log('Configuration loaded:', CONFIG);
  }
});
