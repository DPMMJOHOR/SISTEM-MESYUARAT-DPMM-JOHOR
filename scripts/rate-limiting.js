// ============================================================
// RATE LIMITING
// Add this to index.html in both systems
// ============================================================

// ============================================================
// RATE LIMITER CLASS
// ============================================================
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  check(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    this.requests.set(identifier, validRequests);
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: validRequests[0] + this.windowMs
      };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      resetTime: now + this.windowMs
    };
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }
}

// ============================================================
// RATE LIMITER INSTANCES
// ============================================================

// Login attempts: 5 per 15 minutes
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

// API calls: 100 per minute
const apiRateLimiter = new RateLimiter(100, 60 * 1000);

// Form submissions: 10 per minute
const formRateLimiter = new RateLimiter(10, 60 * 1000);

// Chatbot: 20 per minute
const chatbotRateLimiter = new RateLimiter(20, 60 * 1000);

// ============================================================
// RATE LIMIT CHECKER
// ============================================================
function checkRateLimit(limiter, identifier) {
  const result = limiter.check(identifier);
  
  if (!result.allowed) {
    const waitTime = Math.ceil((result.resetTime - Date.now()) / 1000);
    throw new Error(`Terlalu banyak permintaan. Sila cuba lagi dalam ${waitTime} saat.`);
  }
  
  return result;
}

// ============================================================
// IDENTIFIER GENERATION
// ============================================================
function getIdentifier() {
  const session = JSON.parse(localStorage.getItem('dpmm_session') || 'null');
  if (session && session.user) {
    return session.user.email || session.user.id;
  }
  return 'anonymous_' + crypto.randomUUID();
}

// ============================================================
// USAGE EXAMPLES
// ============================================================

// Example 1: Rate limit login attempts
/*
async function login(email, password) {
  const identifier = email;
  
  try {
    checkRateLimit(loginRateLimiter, identifier);
    // Proceed with login
  } catch (error) {
    alert(error.message);
    return;
  }
}
*/

// Example 2: Rate limit API calls
/*
async function callEdgeFunction(functionName, data) {
  const identifier = getIdentifier();
  
  try {
    checkRateLimit(apiRateLimiter, identifier);
    // Proceed with API call
  } catch (error) {
    alert(error.message);
    return;
  }
}
*/

// Example 3: Rate limit form submissions
/*
document.getElementById('meetingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const identifier = getIdentifier();
  
  try {
    checkRateLimit(formRateLimiter, identifier);
    // Proceed with form submission
  } catch (error) {
    alert(error.message);
    return;
  }
});
*/

// Example 4: Rate limit chatbot
/*
async function aimanSend(contextSnippet, aimanHistory) {
  const identifier = getIdentifier();
  
  try {
    checkRateLimit(chatbotRateLimiter, identifier);
    // Proceed with chatbot call
  } catch (error) {
    return error.message;
  }
}
*/

// ============================================================
// RATE LIMIT RESET (for testing)
// ============================================================
function resetAllRateLimits() {
  const identifier = getIdentifier();
  loginRateLimiter.reset(identifier);
  apiRateLimiter.reset(identifier);
  formRateLimiter.reset(identifier);
  chatbotRateLimiter.reset(identifier);
}
