// ============================================================
// UNIFIED AUTHENTICATION ACROSS BOTH SYSTEMS
// Single sign-on (SSO) using Supabase Auth
// ============================================================

// ============================================================
// AUTH CONFIGURATION
// ============================================================
const AUTH_CONFIG = {
  // Both systems use same Supabase project
  SUPABASE_URL: 'https://lzoloupwtqmjyupvofhh.supabase.co',
  SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY,
  
  // Shared session storage key
  SESSION_KEY: 'dpmm_auth_session',
  
  // Redirect URLs
  MEETING_SYSTEM_URL: window.MEETING_SYSTEM_URL || 'https://dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR',
  MEMBER_SYSTEM_URL: window.MEMBER_SYSTEM_URL || 'https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR',
  
  // Session timeout
  SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
};

// ============================================================
// UNIFIED AUTH CLIENT
// ============================================================
class UnifiedAuth {
  constructor() {
    this.supabase = createClient(AUTH_CONFIG.SUPABASE_URL, AUTH_CONFIG.SUPABASE_ANON_KEY);
    this.session = null;
    this.user = null;
  }

  // Initialize auth
  async init() {
    // Check for existing session
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (session) {
      this.session = session;
      this.user = session.user;
      this.saveSession(session);
    }
    
    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.handleAuthChange(event, session);
    });
  }

  // Login with email and password
  async login(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.session = data.session;
      this.user = data.user;
      this.saveSession(data.session);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout() {
    try {
      await this.supabase.auth.signOut();
      this.clearSession();
      this.session = null;
      this.user = null;
      
      // Redirect to login page
      window.location.href = '/login.html';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Get current session
  getSession() {
    return this.session;
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Get user role
  getUserRole() {
    if (!this.user) return null;
    return this.user.user_metadata?.role || 'user';
  }

  // Check if user is admin
  isAdmin() {
    return this.getUserRole() === 'admin';
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.session;
  }

  // Handle auth state change
  handleAuthChange(event, session) {
    switch (event) {
      case 'SIGNED_IN':
        this.session = session;
        this.user = session.user;
        this.saveSession(session);
        break;
      case 'SIGNED_OUT':
        this.clearSession();
        this.session = null;
        this.user = null;
        break;
      case 'TOKEN_REFRESHED':
        this.session = session;
        this.saveSession(session);
        break;
    }
  }

  // Save session to storage
  saveSession(session) {
    if (session) {
      localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: Date.now() + AUTH_CONFIG.SESSION_TIMEOUT
      }));
    }
  }

  // Clear session from storage
  clearSession() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
  }

  // Switch between systems
  switchSystem(targetSystem) {
    const url = targetSystem === 'meeting' 
      ? AUTH_CONFIG.MEETING_SYSTEM_URL 
      : AUTH_CONFIG.MEMBER_SYSTEM_URL;
    
    // Redirect with session preserved
    window.location.href = url;
  }

  // Get auth token for API calls
  getAuthToken() {
    return this.session?.access_token;
  }
}

// ============================================================
// GLOBAL AUTH INSTANCE
// ============================================================
const unifiedAuth = new UnifiedAuth();

// ============================================================
// AUTH MIDDLEWARE
// ============================================================
async function requireAuth() {
  await unifiedAuth.init();
  
  if (!unifiedAuth.isAuthenticated()) {
    // Redirect to login
    window.location.href = '/login.html';
    return false;
  }
  
  return true;
}

async function requireAdmin() {
  await unifiedAuth.init();
  
  if (!unifiedAuth.isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  
  if (!unifiedAuth.isAdmin()) {
    alert('Akses ditolak. Hanya admin dibenarkan.');
    window.location.href = '/dashboard.html';
    return false;
  }
  
  return true;
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await unifiedAuth.init();
  
  // Auto-redirect if not authenticated (optional)
  if (!unifiedAuth.isAuthenticated() && !window.location.pathname.includes('login.html')) {
    // Uncomment to enable auto-redirect
    // window.location.href = '/login.html';
  }
});
