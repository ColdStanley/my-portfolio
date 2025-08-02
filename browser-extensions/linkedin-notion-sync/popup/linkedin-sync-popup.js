/**
 * LinkedIn to Notion Sync - Popup Script
 * Handles user interactions in the extension popup
 */

console.log('🎨 LinkedIn to Notion Popup Script Loaded');

// DOM Elements
const elements = {
  status: document.getElementById('status'),
  testExtraction: document.getElementById('testExtraction'),
  manualSync: document.getElementById('manualSync'),
  apiUrl: document.getElementById('apiUrl'),
  saveSettings: document.getElementById('saveSettings')
};

// State
let currentJobData = null;

/**
 * Update status display
 */
function updateStatus(type, icon, message) {
  elements.status.className = `status ${type}`;
  elements.status.innerHTML = `<span>${icon}</span><span>${message}</span>`;
}

/**
 * Show loading state on button
 */
function setButtonLoading(button, loading) {
  if (loading) {
    button.innerHTML = '<span class="loading"></span> Loading...';
    button.disabled = true;
  } else {
    // Restore original text based on button id
    switch (button.id) {
      case 'testExtraction':
        button.innerHTML = 'Test Current Page';
        break;
      case 'manualSync':
        button.innerHTML = 'Manual Sync Current Job';
        break;
      case 'saveSettings':
        button.innerHTML = 'Save Settings';
        break;
    }
    button.disabled = false;
  }
}

/**
 * Load current configuration
 */
async function loadConfiguration() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'GET_CONFIG' });
    
    if (response.success) {
      elements.apiUrl.value = response.config.apiBaseUrl;
    }
  } catch (error) {
    console.error('Error loading configuration:', error);
  }
}

/**
 * Test data extraction from current page
 */
async function testCurrentPage() {
  setButtonLoading(elements.testExtraction, true);
  updateStatus('info', '🔍', 'Testing data extraction...');

  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('linkedin.com/jobs')) {
      updateStatus('error', '❌', 'Please navigate to a LinkedIn job page');
      return;
    }

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, { 
      action: 'EXTRACT_CURRENT_JOB' 
    });

    if (response.success && response.data) {
      currentJobData = response.data;
      elements.manualSync.disabled = false;
      
      updateStatus('ready', '✅', `Found: "${response.data.title}" at "${response.data.company}"`);
      
      console.log('✅ Job data extracted:', response.data);
    } else {
      currentJobData = null;
      elements.manualSync.disabled = true;
      updateStatus('error', '❌', 'No job data found on current page');
    }

  } catch (error) {
    console.error('Error testing extraction:', error);
    updateStatus('error', '❌', 'Error testing extraction: ' + error.message);
  } finally {
    setButtonLoading(elements.testExtraction, false);
  }
}

/**
 * Manually sync current job data
 */
async function manualSyncJob() {
  if (!currentJobData) {
    updateStatus('error', '❌', 'No job data available. Test extraction first.');
    return;
  }

  setButtonLoading(elements.manualSync, true);
  updateStatus('info', '🔄', 'Syncing to Notion...');

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'SYNC_LINKEDIN_JOB_TO_NOTION',
      data: currentJobData
    });

    if (response.success) {
      if (response.exists) {
        updateStatus('ready', '⚠️', 'Job already exists in Notion');
      } else {
        updateStatus('ready', '🎉', 'Successfully synced to Notion!');
      }
    } else {
      updateStatus('error', '❌', 'Sync failed: ' + (response.error || 'Unknown error'));
    }

  } catch (error) {
    console.error('Error syncing job:', error);
    updateStatus('error', '❌', 'Sync error: ' + error.message);
  } finally {
    setButtonLoading(elements.manualSync, false);
  }
}

/**
 * Save settings
 */
async function saveSettings() {
  const apiUrl = elements.apiUrl.value.trim();
  
  if (!apiUrl) {
    updateStatus('error', '❌', 'API URL is required');
    return;
  }

  try {
    new URL(apiUrl); // Validate URL format
  } catch (error) {
    updateStatus('error', '❌', 'Invalid URL format');
    return;
  }

  setButtonLoading(elements.saveSettings, true);

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'UPDATE_API_BASE_URL',
      url: apiUrl
    });

    if (response.success) {
      updateStatus('ready', '✅', 'Settings saved successfully');
    } else {
      updateStatus('error', '❌', 'Failed to save settings');
    }

  } catch (error) {
    console.error('Error saving settings:', error);
    updateStatus('error', '❌', 'Error saving settings');
  } finally {
    setButtonLoading(elements.saveSettings, false);
  }
}

/**
 * Check if current tab is LinkedIn job page
 */
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.includes('linkedin.com/jobs')) {
      updateStatus('ready', '✅', 'LinkedIn job page detected');
    } else {
      updateStatus('info', 'ℹ️', 'Navigate to LinkedIn job page to use sync');
    }
  } catch (error) {
    console.error('Error checking current page:', error);
  }
}

// Event Listeners
elements.testExtraction.addEventListener('click', testCurrentPage);
elements.manualSync.addEventListener('click', manualSyncJob);
elements.saveSettings.addEventListener('click', saveSettings);

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎨 Popup initialized');
  
  await loadConfiguration();
  await checkCurrentPage();
  
  // Listen for tab updates
  if (chrome.tabs && chrome.tabs.onUpdated) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active) {
        checkCurrentPage();
      }
    });
  }
});

console.log('✅ Popup script fully initialized');