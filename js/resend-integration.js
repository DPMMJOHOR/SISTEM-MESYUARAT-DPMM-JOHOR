// Resend Email Integration
// Handles email delivery via Resend API
// Resend Documentation: https://resend.com/docs

const Resend = {
  // Resend API key (configured in CONFIG)
  apiKey: typeof CONFIG !== 'undefined' && CONFIG.RESEND_API_KEY ? CONFIG.RESEND_API_KEY : null,
  
  // Default from email (configured in CONFIG)
  fromEmail: typeof CONFIG !== 'undefined' && CONFIG.RESEND_FROM_EMAIL ? CONFIG.RESEND_FROM_EMAIL : 'noreply@yourdomain.com',
  
  // Resend API base URL
  baseUrl: 'https://api.resend.com/emails',
  
  /**
   * Send email via Resend API
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} html - HTML email content
   * @param {string} text - Plain text email content (fallback)
   */
  async sendEmail(to, subject, html, text = '') {
    if (!this.apiKey) {
      console.error('Resend API key not configured');
      return { success: false, error: 'Resend API key not configured' };
    }
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: to,
          subject: subject,
          html: html,
          text: text,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Resend sendEmail failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Send email blast to multiple recipients
   * @param {Array} recipients - Array of email addresses
   * @param {string} subject - Email subject
   * @param {string} html - HTML email content
   * @param {string} text - Plain text email content
   */
  async sendBlast(recipients, subject, html, text = '') {
    const results = {
      total: recipients.length,
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const email of recipients) {
      const result = await this.sendEmail(email, subject, html, text);
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ email, error: result.error });
      }
      
      // Add delay to avoid rate limiting (100ms between emails)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  },
  
  /**
   * Send meeting invitation email
   * @param {Object} meeting - Meeting object with details
   * @param {string} email - Recipient email address
   * @param {string} recipientName - Recipient name
   */
  async sendMeetingInvitation(meeting, email, recipientName = 'Penerima') {
    const subject = `Jemputan Mesyuarat: ${meeting.nama || 'Mesyuarat DPMM'}`;
    const html = this.formatMeetingInvitationHTML(meeting, recipientName);
    const text = this.formatMeetingInvitationText(meeting, recipientName);
    
    return await this.sendEmail(email, subject, html, text);
  },
  
  /**
   * Format meeting invitation HTML
   * @param {Object} meeting - Meeting object
   * @param {string} recipientName - Recipient name
   * @returns {string} - HTML email content
   */
  formatMeetingInvitationHTML(meeting, recipientName) {
    const date = new Date(meeting.tarikh).toLocaleDateString('ms-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jemputan Mesyuarat DPMM Johor</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563EB; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 JEMPUTAN MESYUARAT</h1>
      <h2>DPMM Negeri Johor</h2>
    </div>
    <div class="content">
      <p>Kepada YBhg/Dato'/Dr./Tuan/Puan <strong>${recipientName}</strong>,</p>
      
      <p>Adalah dengan segala hormatnya kami menjemput YBhg/Dato'/Dr./Tuan/Puan untuk menghadiri mesyuarat berikut:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Tarikh:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Tempat:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${meeting.tempat || 'Akan diumumkan'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Agenda:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${meeting.nama || 'Mesyuarat DPMM'}</td>
        </tr>
      </table>
      
      <p>Sila sahkan kehadiran anda dengan membalas emel ini atau menghubungi pentadbir.</p>
      
      <p>Terima kasih atas kerjasama YBhg/Dato'/Dr./Tuan/Puan.</p>
      
      <p style="margin-top: 30px;">
        <em>Sekian,</em><br>
        <strong>Pengurusan Mesyuarat</strong><br>
        Dewan Perniagaan Melayu Malaysia Negeri Johor
      </p>
    </div>
    <div class="footer">
      <p>Email ini dijana secara automatik oleh Sistem Pengurusan Mesyuarat DPMM Johor.</p>
      <p>Jika anda tidak mahu menerima emel ini, sila hubungi pentadbir.</p>
    </div>
  </div>
</body>
</html>`;
  },
  
  /**
   * Format meeting invitation plain text
   * @param {Object} meeting - Meeting object
   * @param {string} recipientName - Recipient name
   * @returns {string} - Plain text email content
   */
  formatMeetingInvitationText(meeting, recipientName) {
    const date = new Date(meeting.tarikh).toLocaleDateString('ms-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `JEMPUTAN MESYUARAT DPMM JOHOR

Kepada YBhg/Dato'/Dr./Tuan/Puan ${recipientName},

Adalah dengan segala hormatnya kami menjemput YBhg/Dato'/Dr./Tuan/Puan untuk menghadiri mesyuarat berikut:

Tarikh: ${date}
Tempat: ${meeting.tempat || 'Akan diumumkan'}
Agenda: ${meeting.nama || 'Mesyuarat DPMM'}

Sila sahkan kehadiran anda dengan membalas emel ini atau menghubungi pentadbir.

Terima kasih atas kerjasama YBhg/Dato'/Dr./Tuan/Puan.

Sekian,
Pengurusan Mesyuarat
Dewan Perniagaan Melayu Malaysia Negeri Johor

---
Email ini dijana secara automatik oleh Sistem Pengurusan Mesyuarat DPMM Johor.`;
  },
  
  /**
   * Send meeting reminder email
   * @param {Object} meeting - Meeting object
   * @param {string} email - Recipient email address
   * @param {string} recipientName - Recipient name
   */
  async sendMeetingReminder(meeting, email, recipientName = 'Penerima') {
    const subject = `Peringatan Mesyuarat: ${meeting.nama || 'Mesyuarat DPMM'}`;
    const html = this.formatMeetingReminderHTML(meeting, recipientName);
    const text = this.formatMeetingReminderText(meeting, recipientName);
    
    return await this.sendEmail(email, subject, html, text);
  },
  
  /**
   * Format meeting reminder HTML
   * @param {Object} meeting - Meeting object
   * @param {string} recipientName - Recipient name
   * @returns {string} - HTML email content
   */
  formatMeetingReminderHTML(meeting, recipientName) {
    const date = new Date(meeting.tarikh).toLocaleDateString('ms-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Peringatan Mesyuarat DPMM Johor</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ PERINGATAN MESYUARAT</h1>
      <h2>DPMM Negeri Johor</h2>
    </div>
    <div class="content">
      <p>Kepada YBhg/Dato'/Dr./Tuan/Puan <strong>${recipientName}</strong>,</p>
      
      <p>Ini adalah peringatan bahawa mesyuarat akan diadakan esok:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Tarikh:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Tempat:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${meeting.tempat || 'Akan diumumkan'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Agenda:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${meeting.nama || 'Mesyuarat DPMM'}</td>
        </tr>
      </table>
      
      <p>Sila pastikan kehadiran anda. Jika anda tidak dapat hadir, sila maklumkan kepada pentadbir.</p>
      
      <p>Terima kasih.</p>
      
      <p style="margin-top: 30px;">
        <em>Sekian,</em><br>
        <strong>Pengurusan Mesyuarat</strong><br>
        Dewan Perniagaan Melayu Malaysia Negeri Johor
      </p>
    </div>
    <div class="footer">
      <p>Email ini dijana secara automatik oleh Sistem Pengurusan Mesyuarat DPMM Johor.</p>
    </div>
  </div>
</body>
</html>`;
  },
  
  /**
   * Format meeting reminder plain text
   * @param {Object} meeting - Meeting object
   * @param {string} recipientName - Recipient name
   * @returns {string} - Plain text email content
   */
  formatMeetingReminderText(meeting, recipientName) {
    const date = new Date(meeting.tarikh).toLocaleDateString('ms-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `PERINGATAN MESYUARAT DPMM JOHOR

Kepada YBhg/Dato'/Dr./Tuan/Puan ${recipientName},

Ini adalah peringatan bahawa mesyuarat akan diadakan esok:

Tarikh: ${date}
Tempat: ${meeting.tempat || 'Akan diumumkan'}
Agenda: ${meeting.nama || 'Mesyuarat DPMM'}

Sila pastikan kehadiran anda. Jika anda tidak dapat hadir, sila maklumkan kepada pentadbir.

Terima kasih.

Sekian,
Pengurusan Mesyuarat
Dewan Perniagaan Melayu Malaysia Negeri Johor

---
Email ini dijana secara automatik oleh Sistem Pengurusan Mesyuarat DPMM Johor.`;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Resend;
}
