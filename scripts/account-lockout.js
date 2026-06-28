// ============================================================
// ACCOUNT LOCKOUT MECHANISM
// Add this to index.html in both systems
// ============================================================

// ============================================================
// LOCKOUT CONFIGURATION
// ============================================================
const LOCKOUT_CONFIG = {
  maxAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  warningThreshold: 3
};

// ============================================================
// LOCKOUT STORAGE
// ============================================================
function getFailedAttempts(identifier) {
  const data = localStorage.getItem(`lockout_${identifier}`);
  if (!data) return { attempts: 0, firstAttempt: null, lockoutUntil: null };
  return JSON.parse(data);
}

function setFailedAttempts(identifier, data) {
  localStorage.setItem(`lockout_${identifier}`, JSON.stringify(data));
}

function clearFailedAttempts(identifier) {
  localStorage.removeItem(`lockout_${identifier}`);
}

// ============================================================
// LOCKOUT CHECK
// ============================================================
function isLockedOut(identifier) {
  const data = getFailedAttempts(identifier);
  
  if (!data.lockoutUntil) return false;
  
  if (Date.now() > data.lockoutUntil) {
    // Lockout expired, clear it
    clearFailedAttempts(identifier);
    return false;
  }
  
  return true;
}

function getLockoutRemaining(identifier) {
  const data = getFailedAttempts(identifier);
  if (!data.lockoutUntil) return 0;
  
  const remaining = data.lockoutUntil - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000));
}

// ============================================================
// FAILED ATTEMPT TRACKING
// ============================================================
function recordFailedAttempt(identifier) {
  const data = getFailedAttempts(identifier);
  const now = Date.now();
  
  if (!data.firstAttempt || (now - data.firstAttempt) > LOCKOUT_CONFIG.lockoutDuration) {
    // Reset if first attempt is too old
    data.attempts = 1;
    data.firstAttempt = now;
  } else {
    data.attempts++;
  }
  
  // Check if should lockout
  if (data.attempts >= LOCKOUT_CONFIG.maxAttempts) {
    data.lockoutUntil = now + LOCKOUT_CONFIG.lockoutDuration;
  }
  
  setFailedAttempts(identifier, data);
  
  return {
    attempts: data.attempts,
    maxAttempts: LOCKOUT_CONFIG.maxAttempts,
    locked: data.lockoutUntil !== null,
    lockoutRemaining: data.lockoutUntil ? getLockoutRemaining(identifier) : 0
  };
}

function recordSuccessfulAttempt(identifier) {
  clearFailedAttempts(identifier);
}

// ============================================================
// LOCKOUT MESSAGES
// ============================================================
function getLockoutMessage(identifier) {
  const remaining = getLockoutRemaining(identifier);
  if (remaining === 0) return '';
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  
  if (minutes > 0) {
    return `Akaun dikunci. Sila cuba lagi dalam ${minutes} minit ${seconds} saat.`;
  }
  return `Akaun dikunci. Sila cuba lagi dalam ${seconds} saat.`;
}

function getWarningMessage(attempts) {
  const remaining = LOCKOUT_CONFIG.maxAttempts - attempts;
  return `Amaran: ${remaining} percubaan lagi sebelum akaun dikunci.`;
}

// ============================================================
// USAGE EXAMPLES
// ============================================================

// Example 1: Login with lockout
/*
async function login(email, password) {
  const identifier = email;
  
  // Check if locked out
  if (isLockedOut(identifier)) {
    alert(getLockoutMessage(identifier));
    return;
  }
  
  // Attempt login
  const result = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (result.error) {
    const status = recordFailedAttempt(identifier);
    
    if (status.locked) {
      alert(getLockoutMessage(identifier));
    } else if (status.attempts >= LOCKOUT_CONFIG.warningThreshold) {
      alert(getWarningMessage(status.attempts) + '\n' + result.error.message);
    } else {
      alert(result.error.message);
    }
    
    return;
  }
  
  // Success - clear failed attempts
  recordSuccessfulAttempt(identifier);
  return result;
}
*/

// Example 2: Reset lockout (admin function)
/*
function resetUserLockout(email) {
  clearFailedAttempts(email);
  alert(`Kunci akaun untuk ${email} telah dipadamkan.`);
}
*/

// ============================================================
// LOCKOUT STATUS DISPLAY
// ============================================================
function displayLockoutStatus(identifier) {
  if (isLockedOut(identifier)) {
    const remaining = getLockoutRemaining(identifier);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    
    return {
      locked: true,
      message: `Akaun dikunci. Masa tinggal: ${minutes}m ${seconds}s`,
      remaining
    };
  }
  
  const data = getFailedAttempts(identifier);
  if (data.attempts > 0) {
    return {
      locked: false,
      attempts: data.attempts,
      maxAttempts: LOCKOUT_CONFIG.maxAttempts,
      message: `Percubaan gagal: ${data.attempts}/${LOCKOUT_CONFIG.maxAttempts}`
    };
  }
  
  return { locked: false, message: 'Tiada percubaan gagal' };
}
