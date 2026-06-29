// QR Code Generator for RSVP and Event Details
// Uses qrcode.js library for QR code generation

// Load qrcode.js library
const qrcodeScript = document.createElement('script');
qrcodeScript.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
qrcodeScript.async = true;
document.head.appendChild(qrcodeScript);

/**
 * Generate QR code for event details
 * @param {string} eventId - Event ID
 * @param {string} eventToken - Unique token for the event
 * @param {string} baseUrl - Base URL for event details page
 * @returns {Promise<string>} - Data URL of the QR code image
 */
async function generateEventQRCode(eventId, eventToken, baseUrl) {
  const eventUrl = `${baseUrl}?event=${eventId}&token=${eventToken}`;
  
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(eventUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    }, (error, url) => {
      if (error) {
        reject(error);
      } else {
        resolve(url);
      }
    });
  });
}

/**
 * Generate QR code for attendee check-in
 * @param {string} eventId - Event ID
 * @param {string} attendeeToken - Unique token for the attendee
 * @param {string} baseUrl - Base URL for check-in
 * @returns {Promise<string>} - Data URL of the QR code image
 */
async function generateAttendeeQRCode(eventId, attendeeToken, baseUrl) {
  const checkInUrl = `${baseUrl}?event=${eventId}&attendee=${attendeeToken}`;
  
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(checkInUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    }, (error, url) => {
      if (error) {
        reject(error);
      } else {
        resolve(url);
      }
    });
  });
}

/**
 * Generate unique event token
 * @returns {string} - Random token
 */
function generateEventToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Generate unique attendee token
 * @param {string} attendeeId - Attendee ID (member ID or email)
 * @returns {string} - Hashed token
 */
function generateAttendeeToken(attendeeId) {
  // Simple hash function for token generation
  let hash = 0;
  const str = attendeeId + Date.now().toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Download QR code as PNG
 * @param {string} dataUrl - Data URL of the QR code
 * @param {string} filename - Filename for download
 */
function downloadQRCode(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Display QR code in UI
 * @param {string} dataUrl - Data URL of the QR code
 * @param {string} containerId - ID of the container element
 */
function displayQRCode(dataUrl, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <img src="${dataUrl}" style="max-width:100%;height:auto;border:2px solid var(--border);border-radius:8px;padding:10px;background:#fff;">
  `;
}

/**
 * Generate and display event QR code
 * @param {string} eventId - Event ID
 * @param {string} containerId - ID of the container element
 */
async function generateAndDisplayEventQR(eventId, containerId) {
  try {
    const eventToken = generateEventToken();
    const baseUrl = window.location.origin + '/event-details.html';
    const dataUrl = await generateEventQRCode(eventId, eventToken, baseUrl);
    
    displayQRCode(dataUrl, containerId);
    
    // Store token for later use
    if (typeof window !== 'undefined') {
      window.currentEventToken = eventToken;
    }
    
    return { dataUrl, token: eventToken };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate batch QR codes for attendees
 * @param {Array} attendees - Array of attendee objects
 * @param {string} eventId - Event ID
 * @param {string} baseUrl - Base URL for check-in
 * @returns {Promise<Array>} - Array of data URLs
 */
async function generateBatchAttendeeQRCodes(attendees, eventId, baseUrl) {
  const qrCodes = [];
  
  for (const attendee of attendees) {
    try {
      const token = generateAttendeeToken(attendee.id);
      const dataUrl = await generateAttendeeQRCode(eventId, token, baseUrl);
      qrCodes.push({
        attendeeId: attendee.id,
        attendeeName: attendee.name,
        token: token,
        dataUrl: dataUrl
      });
    } catch (error) {
      console.error(`Error generating QR code for ${attendee.name}:`, error);
    }
  }
  
  return qrCodes;
}
