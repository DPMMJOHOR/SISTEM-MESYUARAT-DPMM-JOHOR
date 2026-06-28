// ============================================================
// ENVIRONMENT-SPECIFIC CONFIGURATION
// Support for dev/staging/production environments
// ============================================================

// ============================================================
// ENVIRONMENT DETECTION
// ============================================================
function detectEnvironment() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('staging') || hostname.includes('test')) {
    return 'staging';
  }
  
  if (hostname.includes('github.io')) {
    return 'production';
  }
  
  return 'production';
}

// ============================================================
// ENVIRONMENT CONFIGURATIONS
// ============================================================
const ENV_CONFIGS = {
  development: {
    SUPABASE_URL: 'https://lzoloupwtqmjyupvofhh.supabase.co',
    SUPABASE_ANON_KEY: window.DEV_SUPABASE_ANON_KEY || '',
    WHATSAPP_API_URL: 'http://localhost:3000/api/whatsapp',
    GROQ_API_URL: 'http://localhost:3000/api/groq',
    EDGE_FUNCTION_BASE: 'http://localhost:3000/functions/v1',
    MEETING_SYSTEM_URL: 'http://localhost:3001',
    MEMBER_SYSTEM_URL: 'http://localhost:3002',
    ENABLE_CHATBOT: true,
    ENABLE_WHATSAPP: true,
    ENABLE_BLAST: true,
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug'
  },
  
  staging: {
    SUPABASE_URL: 'https://lzoloupwtqmjyupvofhh.supabase.co',
    SUPABASE_ANON_KEY: window.STAGING_SUPABASE_ANON_KEY || '',
    WHATSAPP_API_URL: 'https://staging-api.dpmmjohor.com/functions/v1/whatsapp-blast',
    GROQ_API_URL: 'https://staging-api.dpmmjohor.com/functions/v1/groq-chatbot',
    EDGE_FUNCTION_BASE: 'https://staging-api.dpmmjohor.com/functions/v1',
    MEETING_SYSTEM_URL: 'https://staging.dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR',
    MEMBER_SYSTEM_URL: 'https://staging.dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR',
    ENABLE_CHATBOT: true,
    ENABLE_WHATSAPP: true,
    ENABLE_BLAST: true,
    DEBUG_MODE: true,
    LOG_LEVEL: 'info'
  },
  
  production: {
    SUPABASE_URL: 'https://lzoloupwtqmjyupvofhh.supabase.co',
    SUPABASE_ANON_KEY: window.PROD_SUPABASE_ANON_KEY || '',
    WHATSAPP_API_URL: 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/whatsapp-blast',
    GROQ_API_URL: 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/groq-chatbot',
    EDGE_FUNCTION_BASE: 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1',
    MEETING_SYSTEM_URL: 'https://dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR',
    MEMBER_SYSTEM_URL: 'https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR',
    ENABLE_CHATBOT: true,
    ENABLE_WHATSAPP: true,
    ENABLE_BLAST: true,
    DEBUG_MODE: false,
    LOG_LEVEL: 'error'
  }
};

// ============================================================
// GET CURRENT CONFIG
// ============================================================
function getEnvConfig() {
  const env = detectEnvironment();
  const config = ENV_CONFIGS[env] || ENV_CONFIGS.production;
  
  // Override with window variables if set
  return {
    ...config,
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY,
    ENVIRONMENT: env
  };
}

// ============================================================
// LOGGING
// ============================================================
function log(level, message, data = null) {
  const config = getEnvConfig();
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  
  if (levels[level] >= levels[config.LOG_LEVEL]) {
    console[level](`[${config.ENVIRONMENT.toUpperCase()}]`, message, data || '');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const config = getEnvConfig();
  log('info', 'Environment loaded', { environment: config.ENVIRONMENT });
  
  if (config.DEBUG_MODE) {
    console.log('Configuration:', config);
  }
});
