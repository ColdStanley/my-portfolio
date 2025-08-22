/**
 * LinkedIn to Supabase Background Script
 * Handles API calls to sync LinkedIn job data to Supabase JD2CV database
 */

console.log('🔄 LinkedIn JD2CV Supabase Background Script - Service Worker Started');

// Configuration
const CONFIG = {
  // Default to your production URL, can be updated via popup settings
  API_BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    SAVE_JD: '/api/jd2cv/supabase',
    SEARCH_JD: '/api/jd2cv/supabase'
  },
  NOTIFICATION_DURATION: 4000,
  // Default user ID - should be configured via popup
  DEFAULT_USER_ID: '58838ee2-16ad-4fff-b745-5f7f6ffa9945'
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
 * Get user ID from storage or use default
 */
async function getUserId() {
  try {
    const result = await chrome.storage.sync.get(['userId']);
    return result.userId || CONFIG.DEFAULT_USER_ID;
  } catch (error) {
    console.error('Error getting user ID from storage:', error);
    return CONFIG.DEFAULT_USER_ID;
  }
}

/**
 * Check if job already exists in Supabase
 */
async function checkJobExists(jobData, userId) {
  try {
    const apiBaseUrl = await getApiBaseUrl();
    const searchUrl = `${apiBaseUrl}${CONFIG.ENDPOINTS.SEARCH_JD}?user_id=${userId}`;
    
    const response = await fetch(searchUrl);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Search request failed');
    }

    // Check if any existing record matches both title and company
    const existingRecord = result.data && result.data.find(record => 
      record.title.toLowerCase() === jobData.title.toLowerCase() && 
      record.company.toLowerCase() === jobData.company.toLowerCase()
    );

    return existingRecord ? { found: true, record: existingRecord } : { found: false };
  } catch (error) {
    console.error('Error checking if job exists:', error);
    return { found: false, error: error.message };
  }
}

/**
 * Save job data to Supabase via JD2CV API
 */
async function syncJobDataToSupabase(jobData) {
  try {
    const apiBaseUrl = await getApiBaseUrl();
    const userId = await getUserId();
    const saveUrl = `${apiBaseUrl}${CONFIG.ENDPOINTS.SAVE_JD}`;
    
    console.log('📤 Syncing job data to Supabase:', {
      title: jobData.title,
      company: jobData.company,
      userId: userId,
      url: saveUrl
    });

    // Check if job already exists
    const existingJob = await checkJobExists(jobData, userId);
    
    if (existingJob.found) {
      // Job already exists
      await showNotification({
        type: 'warning',
        title: 'Job Already Exists',
        message: `"${jobData.title}" at "${jobData.company}" is already in your JD2CV database.`
      });
      return { success: true, exists: true, data: existingJob.record };
    }

    // Save new job data
    const saveData = {
      user_id: userId,
      title: jobData.title,
      company: jobData.company,
      full_job_description: jobData.full_job_description?.replace(/\r\n/g, '\n').replace(/\r/g, '\n') || '',
      comment: jobData.comment || ''
    };

    const saveResponse = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saveData)
    });

    if (!saveResponse.ok) {
      const errorResult = await saveResponse.json();
      throw new Error(`API request failed: ${saveResponse.status} ${saveResponse.statusText} - ${errorResult.error || ''}`);
    }

    const saveResult = await saveResponse.json();
    
    if (saveResult.success || saveResult.data) {
      // Success
      await showNotification({
        type: 'success',
        title: 'LinkedIn Job Synced! 🎉',
        message: `"${jobData.title}" at "${jobData.company}" has been saved to your JD2CV Supabase database.`
      });
      
      console.log('✅ Job successfully synced to Supabase:', saveResult);
      return { success: true, data: saveResult };
    } else {
      throw new Error(saveResult.error || 'Unknown API error');
    }

  } catch (error) {
    console.error('❌ Error syncing job data to Supabase:', error);
    
    await showNotification({
      type: 'error',
      title: 'Sync Failed',
      message: `Failed to sync "${jobData.title}" to Supabase. ${error.message}`
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

  // 使用扩展内本地图片，避免 MV3 data URL 报错
  const iconUrl = chrome.runtime.getURL("icons/icon48.png");

  try {
    const notificationId = await chrome.notifications.create({
      type: 'basic',
      iconUrl: iconUrl,
      title: `${iconMap[type] || ''} ${title}`,
      message: message,
      requireInteraction: false
    });

    // 自动关闭通知
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
    case 'SYNC_LINKEDIN_JOB_TO_SUPABASE':
      // Handle async operation
      syncJobDataToSupabase(message.data)
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

    case 'UPDATE_USER_ID':
      chrome.storage.sync.set({ userId: message.userId })
        .then(() => {
          console.log('✅ User ID updated:', message.userId);
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('❌ Error updating User ID:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;

    case 'GET_CONFIG':
      Promise.all([getApiBaseUrl(), getUserId()])
        .then(([apiBaseUrl, userId]) => {
          sendResponse({ 
            success: true, 
            config: { 
              apiBaseUrl,
              userId,
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
  console.log('🚀 LinkedIn JD2CV Supabase extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Set default configuration
    chrome.storage.sync.set({
      apiBaseUrl: CONFIG.API_BASE_URL,
      userId: CONFIG.DEFAULT_USER_ID,
      autoSync: true
    });
    
    showNotification({
      type: 'info',
      title: 'Extension Installed',
      message: 'LinkedIn JD2CV Supabase sync is ready! Visit any LinkedIn job page and click Save to test.'
    });
  }
});

console.log('✅ LinkedIn JD2CV Supabase background script fully initialized');