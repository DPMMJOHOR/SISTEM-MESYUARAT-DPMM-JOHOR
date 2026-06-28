// ============================================================
// BLAST ERROR UI WITH RETRY CAPABILITY
// Add to index.html in both systems
// ============================================================

// ============================================================
// ERROR UI COMPONENT
// ============================================================
class BlastErrorUI {
  constructor() {
    this.errorContainer = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  // Create error container
  createErrorContainer() {
    if (this.errorContainer) return;

    this.errorContainer = document.createElement('div');
    this.errorContainer.id = 'blast-error-container';
    this.errorContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee2e2;
      border: 1px solid #ef4444;
      border-radius: 8px;
      padding: 16px;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      display: none;
    `;

    document.body.appendChild(this.errorContainer);
  }

  // Show error
  showError(error, context = '') {
    this.createErrorContainer();

    const errorMessage = `
      <div style="margin-bottom: 12px;">
        <strong style="color: #dc2626;">Ralat WhatsApp Blast</strong>
        ${context ? `<p style="margin: 8px 0; color: #991b1b;">${context}</p>` : ''}
        <p style="margin: 8px 0; color: #7f1d1d; font-size: 14px;">${error.message || error}</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${this.retryCount < this.maxRetries ? `
          <button onclick="blastErrorUI.retry()" style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Cuba Semula (${this.maxRetries - this.retryCount} lagi)</button>
        ` : ''}
        <button onclick="blastErrorUI.dismiss()" style="
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Tutup</button>
      </div>
    `;

    this.errorContainer.innerHTML = errorMessage;
    this.errorContainer.style.display = 'block';
  }

  // Show success
  showSuccess(message) {
    this.createErrorContainer();

    const successMessage = `
      <div style="margin-bottom: 12px;">
        <strong style="color: #059669;">Berjaya</strong>
        <p style="margin: 8px 0; color: #065f46; font-size: 14px;">${message}</p>
      </div>
      <button onclick="blastErrorUI.dismiss()" style="
        background: #059669;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      ">Tutup</button>
    `;

    this.errorContainer.innerHTML = successMessage;
    this.errorContainer.style.display = 'block';

    // Auto-dismiss after 5 seconds
    setTimeout(() => this.dismiss(), 5000);
  }

  // Retry operation
  async retry() {
    this.retryCount++;
    this.dismiss();

    if (this.onRetry) {
      await this.onRetry();
    }
  }

  // Dismiss error
  dismiss() {
    if (this.errorContainer) {
      this.errorContainer.style.display = 'none';
    }
  }

  // Reset retry count
  resetRetry() {
    this.retryCount = 0;
  }

  // Set retry callback
  setRetryCallback(callback) {
    this.onRetry = callback;
  }
}

// ============================================================
// GLOBAL INSTANCE
// ============================================================
const blastErrorUI = new BlastErrorUI();

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  blastErrorUI.createErrorContainer();
});
