// Google Drive Integration for Buku Mesyuarat
// Handles uploading and sharing meeting minutes via Google Drive
// Google Drive API Documentation: https://developers.google.com/drive/api/v3/reference

const GoogleDrive = {
  // Google Client ID (configured in CONFIG)
  clientId: typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_CID ? CONFIG.GOOGLE_CID : null,
  
  // Main folder name for meeting minutes
  mainFolder: 'Sistem Pengurusan Mesyuarat DPMM Johor',
  
  // OAuth2 scopes
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
  
  // Access token (set after OAuth flow)
  accessToken: null,
  
  /**
   * Initialize Google Drive API
   * Loads Google API client library
   */
  async initialize() {
    if (!this.clientId) {
      console.error('Google Client ID not configured');
      return { success: false, error: 'Google Client ID not configured' };
    }
    
    try {
      // Load Google API client
      await this.loadGAPI();
      
      // Initialize Google Identity Services
      await this.loadGIS();
      
      return { success: true };
    } catch (error) {
      console.error('Google Drive initialization failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Load Google API client library
   */
  loadGAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client', () => {
          gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          }).then(resolve).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
  
  /**
   * Load Google Identity Services
   */
  loadGIS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
  
  /**
   * Authenticate with Google OAuth2
   */
  async authenticate() {
    if (!this.clientId) {
      return { success: false, error: 'Google Client ID not configured' };
    }
    
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes.join(' '),
        callback: (response) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            gapi.client.setToken({ access_token: response.access_token });
          }
        },
      });
      
      tokenClient.requestAccessToken();
      
      return { success: true };
    } catch (error) {
      console.error('Google authentication failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Create or get main folder for meeting minutes
   */
  async getOrCreateMainFolder() {
    try {
      // Search for existing folder
      const response = await gapi.client.drive.files.list({
        q: `name='${this.mainFolder}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });
      
      if (response.result.files.length > 0) {
        return { success: true, folderId: response.result.files[0].id };
      }
      
      // Create new folder
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: this.mainFolder,
          mimeType: 'application/vnd.google-apps.folder',
        },
      });
      
      return { success: true, folderId: createResponse.result.id };
    } catch (error) {
      console.error('Failed to get/create main folder:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Create or get folder for a specific meeting
   * @param {string} meetingId - Meeting ID
   * @param {string} meetingName - Meeting name
   * @param {string} parentFolderId - Parent folder ID
   */
  async getOrCreateMeetingFolder(meetingId, meetingName, parentFolderId) {
    try {
      const folderName = `${meetingId} - ${meetingName}`;
      
      // Search for existing folder
      const response = await gapi.client.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });
      
      if (response.result.files.length > 0) {
        return { success: true, folderId: response.result.files[0].id };
      }
      
      // Create new folder
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId],
        },
      });
      
      return { success: true, folderId: createResponse.result.id };
    } catch (error) {
      console.error('Failed to get/create meeting folder:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Upload meeting minutes to Google Drive
   * @param {File} file - File to upload
   * @param {string} meetingId - Meeting ID
   * @param {string} meetingName - Meeting name
   */
  async uploadMeetingMinutes(file, meetingId, meetingName) {
    try {
      // Get main folder
      const mainFolderResult = await this.getOrCreateMainFolder();
      if (!mainFolderResult.success) {
        throw new Error(mainFolderResult.error);
      }
      
      // Get meeting folder
      const meetingFolderResult = await this.getOrCreateMeetingFolder(
        meetingId,
        meetingName,
        mainFolderResult.folderId
      );
      if (!meetingFolderResult.success) {
        throw new Error(meetingFolderResult.error);
      }
      
      // Upload file
      const metadata = {
        name: file.name,
        parents: [meetingFolderResult.folderId],
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);
      
      const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${this.accessToken}` }),
        body: form,
      });
      
      const uploadData = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error?.message || 'Failed to upload file');
      }
      
      // Make file shareable
      await this.makeFileShareable(uploadData.id);
      
      // Get shareable link
      const shareLink = await this.getShareableLink(uploadData.id);
      
      return { success: true, fileId: uploadData.id, shareLink };
    } catch (error) {
      console.error('Failed to upload meeting minutes:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Make file shareable (anyone with link can view)
   * @param {string} fileId - File ID
   */
  async makeFileShareable(fileId) {
    try {
      await gapi.client.drive.permissions.create({
        fileId: fileId,
        resource: {
          role: 'reader',
          type: 'anyone',
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to make file shareable:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Get shareable link for a file
   * @param {string} fileId - File ID
   */
  async getShareableLink(fileId) {
    try {
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink',
      });
      
      return response.result.webViewLink;
    } catch (error) {
      console.error('Failed to get shareable link:', error);
      return null;
    }
  },
  
  /**
   * List files in a meeting folder
   * @param {string} meetingId - Meeting ID
   * @param {string} meetingName - Meeting name
   */
  async listMeetingFiles(meetingId, meetingName) {
    try {
      // Get main folder
      const mainFolderResult = await this.getOrCreateMainFolder();
      if (!mainFolderResult.success) {
        throw new Error(mainFolderResult.error);
      }
      
      // Get meeting folder
      const folderName = `${meetingId} - ${meetingName}`;
      const folderResponse = await gapi.client.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${mainFolderResult.folderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });
      
      if (folderResponse.result.files.length === 0) {
        return { success: true, files: [] };
      }
      
      const meetingFolderId = folderResponse.result.files[0].id;
      
      // List files in meeting folder
      const filesResponse = await gapi.client.drive.files.list({
        q: `'${meetingFolderId}' in parents and trashed=false`,
        fields: 'files(id, name, webViewLink, createdTime, size)',
        orderBy: 'createdTime desc',
      });
      
      return { success: true, files: filesResponse.result.files };
    } catch (error) {
      console.error('Failed to list meeting files:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Delete a file from Google Drive
   * @param {string} fileId - File ID
   */
  async deleteFile(fileId) {
    try {
      await gapi.client.drive.files.delete({
        fileId: fileId,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete file:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleDrive;
}
