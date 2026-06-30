// WAHA (WhatsApp HTTP API) Integration
// Handles WhatsApp message sending via local WAHA instance
// WAHA Documentation: https://waha.devlike.pro/

const WAHA = {
  // WAHA base URL (configured in CONFIG or defaults to localhost)
  baseUrl: typeof CONFIG !== 'undefined' && CONFIG.WAHA_URL ? CONFIG.WAHA_URL : 'http://localhost:3000',
  
  /**
   * Check if WAHA instance is connected and ready
   */
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/sessions`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return { connected: true, sessions: data };
      }
      return { connected: false, error: 'No active WhatsApp sessions' };
    } catch (error) {
      console.error('WAHA connection check failed:', error);
      return { connected: false, error: error.message };
    }
  },
  
  /**
   * Send text message via WAHA
   * @param {string} chatId - WhatsApp chat ID (e.g., 60123456789@c.us)
   * @param {string} message - Message content
   * @param {string} sessionId - WAHA session ID (default: 'default')
   */
  async sendTextMessage(chatId, message, sessionId = 'default') {
    try {
      const response = await fetch(`${this.baseUrl}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: sessionId,
          chatId: chatId,
          text: message,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('WAHA sendText failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send image message via WAHA
   * @param {string} chatId - WhatsApp chat ID (e.g., 60123456789@c.us)
   * @param {string} imageUrl - URL of the image to send
   * @param {string} caption - Image caption (optional)
   * @param {string} sessionId - WAHA session ID (default: 'default')
   */
  async sendImageMessage(chatId, imageUrl, caption = '', sessionId = 'default') {
    try {
      const response = await fetch(`${this.baseUrl}/api/sendImage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: sessionId,
          chatId: chatId,
          url: imageUrl,
          caption: caption,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send image');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('WAHA sendImage failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Send WhatsApp blast to multiple recipients
   * @param {Array} recipients - Array of phone numbers (e.g., ['60123456789'])
   * @param {string} message - Message content
   * @param {string} sessionId - WAHA session ID
   */
  async sendBlast(recipients, message, sessionId = 'default') {
    const results = {
      total: recipients.length,
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const phone of recipients) {
      // Clean phone number and format for WhatsApp
      const chatId = this.formatPhoneForWhatsApp(phone);
      
      const result = await this.sendTextMessage(chatId, message, sessionId);
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ phone, error: result.error });
      }
      
      // Add delay to avoid rate limiting (1 second between messages)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  },
  
  /**
   * Format phone number for WhatsApp
   * @param {string} phone - Phone number in various formats
   * @returns {string} - Formatted chat ID (e.g., 60123456789@c.us)
   */
  formatPhoneForWhatsApp(phone) {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove leading 0 if present (Malaysian format)
    if (cleaned.startsWith('0')) {
      cleaned = '60' + cleaned.substring(1);
    }
    
    // Add country code if not present (assume Malaysia: 60)
    if (!cleaned.startsWith('60')) {
      cleaned = '60' + cleaned;
    }
    
    return `${cleaned}@c.us`;
  },
  
  /**
   * Get QR code for WhatsApp session connection
   * @param {string} sessionId - WAHA session ID
   */
  async getQRCode(sessionId = 'default') {
    try {
      const response = await fetch(`${this.baseUrl}/api/${sessionId}/qr/scan`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get QR code');
      }
      
      return { success: true, qrCode: data.qr };
    } catch (error) {
      console.error('WAHA getQRCode failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Get session status
   * @param {string} sessionId - WAHA session ID
   */
  async getSessionStatus(sessionId = 'default') {
    try {
      const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get session status');
      }
      
      return { success: true, status: data };
    } catch (error) {
      console.error('WAHA getSessionStatus failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Send meeting invitation via WhatsApp
   * @param {Object} meeting - Meeting object with details
   * @param {string} phone - Recipient phone number
   * @param {string} sessionId - WAHA session ID
   */
  async sendMeetingInvitation(meeting, phone, sessionId = 'default') {
    const message = this.formatMeetingInvitation(meeting);
    return await this.sendTextMessage(
      this.formatPhoneForWhatsApp(phone),
      message,
      sessionId
    );
  },
  
  /**
   * Format meeting invitation message
   * @param {Object} meeting - Meeting object
   * @returns {string} - Formatted message
   */
  formatMeetingInvitation(meeting) {
    const date = new Date(meeting.tarikh).toLocaleDateString('ms-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `📢 *JEMPUTAN MESYUARAT DPMM JOHOR*

🗓️ Tarikh: ${date}
📍 Tempat: ${meeting.tempat || 'Akan diumumkan'}
📋 Agenda: ${meeting.nama || 'Mesyuarat DPMM'}

Sila sahkan kehadiran anda dengan membalas:
✅ Hadir
❌ Tidak Hadir
❓ Tidak Pasti

Terima kasih.

---
*Pengurusan Mesyuarat DPMM Negeri Johor*`;
  },
  
  /**
   * Send meeting reminder via WhatsApp
   * @param {Object} meeting - Meeting object
   * @param {string} phone - Recipient phone number
   * @param {string} sessionId - WAHA session ID
   */
  async sendMeetingReminder(meeting, phone, sessionId = 'default') {
    const message = this.formatMeetingReminder(meeting);
    return await this.sendTextMessage(
      this.formatPhoneForWhatsApp(phone),
      message,
      sessionId
    );
  },
  
  /**
   * Format meeting reminder message
   * @param {Object} meeting - Meeting object
   * @returns {string} - Formatted message
   */
  formatMeetingReminder(meeting) {
    const date = new Date(meeting.tarikh).toLocaleDateString('ms-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `⏰ *PERINGATAN MESYUARAT*

Mesyuarat akan diadakan esok:
🗓️ Tarikh: ${date}
📍 Tempat: ${meeting.tempat || 'Akan diumumkan'}
📋 Agenda: ${meeting.nama || 'Mesyuarat DPMM'}

Sila pastikan kehadiran anda.

---
*Pengurusan Mesyuarat DPMM Negeri Johor*`;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WAHA;
}
