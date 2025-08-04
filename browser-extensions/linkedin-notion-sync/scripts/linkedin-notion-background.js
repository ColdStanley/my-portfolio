/**
 * LinkedIn to Notion Background Script
 * Handles API calls to sync LinkedIn job data to Notion JD2CV database
 */

console.log('🔄 LinkedIn to Notion Background Script - Service Worker Started');

// Configuration
const CONFIG = {
  // Default to localhost for development, can be updated via popup settings
  API_BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    SAVE_JD: '/api/jd2cv/save-jd',
    SEARCH_JD: '/api/jd2cv/search'
  },
  NOTIFICATION_DURATION: 3000
};

/**
 * Get API base URL from storage or use default
 */
async function getApiBaseUrl() {
  try {
    const result = await chrome.storage.sync.get(['apiBaseUrl']);
    return result.apiBaseUrl || CONFIG.API_BASE_URL;
  } catch (error) {
    console.error('Error getting API base URL from storage:', error);
    return CONFIG.API_BASE_URL;
  }
}

/**
 * Save job data to Notion via JD2CV API
 */
async function syncJobDataToNotion(jobData) {
  try {
    const apiBaseUrl = await getApiBaseUrl();
    const saveUrl = `${apiBaseUrl}${CONFIG.ENDPOINTS.SAVE_JD}`;
    
    console.log('📤 Syncing job data to Notion:', {
      title: jobData.title,
      company: jobData.company,
      url: saveUrl
    });

    // Check if job already exists
    const searchUrl = `${apiBaseUrl}${CONFIG.ENDPOINTS.SEARCH_JD}`;
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: jobData.title,
        company: jobData.company
      })
    });

    const searchResult = await searchResponse.json();
    
    if (searchResult.found) {
      // Job already exists
      await showNotification({
        type: 'warning',
        title: 'Job Already Exists',
        message: `"${jobData.title}" at "${jobData.company}" is already in your Notion database.`
      });
      return { success: true, exists: true, data: searchResult.record };
    }

    // Save new job data
    const saveResponse = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: jobData.title,
        company: jobData.company,
        full_job_description: jobData.full_job_description?.replace(/\r\n/g, '\n').replace(/\r/g, '\n') || '',
        application_stage: jobData.application_stage,
        linkedin_url: jobData.linkedin_url,
        location: jobData.location,
        synced_from_linkedin: true,
        synced_at: jobData.extracted_at
      })
    });

    if (!saveResponse.ok) {
      throw new Error(`API request failed: ${saveResponse.status} ${saveResponse.statusText}`);
    }

    const saveResult = await saveResponse.json();
    
    if (saveResult.success || saveResult.id) {
      // Success
      await showNotification({
        type: 'success',
        title: 'LinkedIn Job Synced! 🎉',
        message: `"${jobData.title}" at "${jobData.company}" has been saved to your Notion JD2CV database.`
      });
      
      console.log('✅ Job successfully synced to Notion:', saveResult);
      return { success: true, data: saveResult };
    } else {
      throw new Error(saveResult.error || 'Unknown API error');
    }

  } catch (error) {
    console.error('❌ Error syncing job data to Notion:', error);
    
    await showNotification({
      type: 'error',
      title: 'Sync Failed',
      message: `Failed to sync "${jobData.title}" to Notion. ${error.message}`
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Show notification to user
 */
async function showNotification({ type, title, message }) {
  const iconMap = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };

  try {
    const notificationId = await chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/linkedin-notion-48.png', // fallback to default icon
      title: `${iconMap[type] || ''} ${title}`,
      message: message,
      requireInteraction: false
    });

    // Auto-clear notification using the returned notification ID
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, CONFIG.NOTIFICATION_DURATION);
    
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Handle messages from content script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background script received message:', message.action);

  switch (message.action) {
    case 'SYNC_LINKEDIN_JOB_TO_NOTION':
      // Handle async operation
      syncJobDataToNotion(message.data)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      
      // Return true to indicate we'll send response asynchronously
      return true;

    case 'UPDATE_API_BASE_URL':
      chrome.storage.sync.set({ apiBaseUrl: message.url })
        .then(() => {
          console.log('✅ API base URL updated:', message.url);
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('❌ Error updating API base URL:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;

    case 'GET_CONFIG':
      getApiBaseUrl()
        .then(apiBaseUrl => {
          sendResponse({ 
            success: true, 
            config: { 
              apiBaseUrl,
              endpoints: CONFIG.ENDPOINTS 
            } 
          });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
      break;
  }
});

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🚀 LinkedIn to Notion Sync extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Set default configuration
    chrome.storage.sync.set({
      apiBaseUrl: CONFIG.API_BASE_URL,
      autoSync: true
    });
    
    showNotification({
      type: 'info',
      title: 'Extension Installed',
      message: 'LinkedIn to Notion sync is ready! Visit any LinkedIn job page and click Save to test.'
    });
  }
});

console.log('✅ LinkedIn to Notion background script fully initialized');