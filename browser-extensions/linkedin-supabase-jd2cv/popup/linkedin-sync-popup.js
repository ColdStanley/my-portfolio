/**
 * LinkedIn JD2CV Supabase Sync - Popup Script
 * Handles popup interface interactions and settings management
 */

console.log('🎛️ LinkedIn JD2CV Supabase Sync - Popup Script Loaded');

// DOM Elements
const statusDiv = document.getElementById('status');
const testExtractionBtn = document.getElementById('testExtraction');
const manualSyncBtn = document.getElementById('manualSync');
const saveSettingsBtn = document.getElementById('saveSettings');
const apiUrlInput = document.getElementById('apiUrl');
const userIdInput = document.getElementById('userId');
const currentApiUrlSpan = document.getElementById('currentApiUrl');
const currentUserIdSpan = document.getElementById('currentUserId');

// State
let currentJobData = null;

/**
 * Update status display
 */
function updateStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

/**
 * Load current configuration
 */
async function loadCurrentConfig() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'GET_CONFIG' });
    
    if (response.success) {
      const { apiBaseUrl, userId } = response.config;
      
      // Update display
      currentApiUrlSpan.textContent = apiBaseUrl || 'Not set';
      currentUserIdSpan.textContent = userId ? `${userId.substring(0, 8)}...` : 'Not set';
      
      // Update input fields
      apiUrlInput.value = apiBaseUrl || '';
      userIdInput.value = userId || '';
      
      console.log('✅ Configuration loaded:', response.config);
    } else {
      throw new Error(response.error || 'Failed to load config');
    }
  } catch (error) {
    console.error('❌ Error loading config:', error);
    updateStatus('Error loading configuration', 'error');
  }
}

/**
 * Test data extraction from current LinkedIn page
 */
async function testExtraction() {
  updateStatus('Testing page extraction...', 'info');
  testExtractionBtn.disabled = true;
  
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('linkedin.com/jobs')) {
      updateStatus('Please navigate to a LinkedIn job page', 'error');
      return;
    }

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_CURRENT_JOB' });
    
    if (response.success && response.data) {
      currentJobData = response.data;
      updateStatus(`Extracted: "${response.data.title}" at "${response.data.company}"`, 'ready');
      manualSyncBtn.disabled = false;
      
      console.log('✅ Extraction successful:', response.data);
    } else {
      updateStatus('No job data found on current page', 'error');
      manualSyncBtn.disabled = true;
      currentJobData = null;
    }
    
  } catch (error) {
    console.error('❌ Error testing extraction:', error);
    updateStatus('Error testing extraction', 'error');
    manualSyncBtn.disabled = true;
    currentJobData = null;
  } finally {
    testExtractionBtn.disabled = false;
  }
}

/**
 * Manually sync extracted job data
 */
async function manualSync() {
  if (!currentJobData) {
    updateStatus('No job data to sync', 'error');
    return;
  }

  updateStatus('Syncing to Supabase...', 'info');
  manualSyncBtn.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({ 
      action: 'SYNC_LINKEDIN_JOB_TO_SUPABASE',
      data: currentJobData
    });

    if (response.success) {
      if (response.exists) {
        updateStatus('Job already exists in database', 'info');
      } else {
        updateStatus('Job synced successfully!', 'ready');
      }
    } else {
      throw new Error(response.error || 'Sync failed');
    }

  } catch (error) {
    console.error('❌ Error syncing job:', error);
    updateStatus('Sync failed: ' + error.message, 'error');
  } finally {
    manualSyncBtn.disabled = false;
  }
}

/**
 * Save settings to extension storage
 */
async function saveSettings() {
  const apiUrl = apiUrlInput.value.trim();
  const userId = userIdInput.value.trim();

  if (!apiUrl || !userId) {
    updateStatus('Please enter both API URL and User ID', 'error');
    return;
  }

  // Validate URL format
  try {
    new URL(apiUrl);
  } catch {
    updateStatus('Please enter a valid API URL', 'error');
    return;
  }

  // Validate User ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    updateStatus('Please enter a valid User ID (UUID format)', 'error');
    return;
  }

  saveSettingsBtn.disabled = true;
  updateStatus('Saving settings...', 'info');

  try {
    // Update API URL
    const apiResponse = await chrome.runtime.sendMessage({ 
      action: 'UPDATE_API_BASE_URL', 
      url: apiUrl 
    });

    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Failed to update API URL');
    }

    // Update User ID
    const userResponse = await chrome.runtime.sendMessage({ 
      action: 'UPDATE_USER_ID', 
      userId: userId 
    });

    if (!userResponse.success) {
      throw new Error(userResponse.error || 'Failed to update User ID');
    }

    updateStatus('Settings saved successfully!', 'ready');
    
    // Reload configuration display
    setTimeout(() => loadCurrentConfig(), 500);

  } catch (error) {
    console.error('❌ Error saving settings:', error);
    updateStatus('Error saving settings: ' + error.message, 'error');
  } finally {
    saveSettingsBtn.disabled = false;
  }
}

/**
 * Check if current page is a LinkedIn job page
 */
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.includes('linkedin.com/jobs')) {
      updateStatus('LinkedIn job page detected - ready to extract', 'ready');
      testExtractionBtn.textContent = 'Extract Job Data';
    } else {
      updateStatus('Navigate to LinkedIn job page to extract data', 'info');
      testExtractionBtn.textContent = 'Test Current Page';
    }
  } catch (error) {
    console.error('❌ Error checking current page:', error);
  }
}

// Event Listeners
testExtractionBtn.addEventListener('click', testExtraction);
manualSyncBtn.addEventListener('click', manualSync);
saveSettingsBtn.addEventListener('click', saveSettings);

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎛️ Popup DOM loaded - initializing...');
  
  loadCurrentConfig();
  checkCurrentPage();
});

console.log('✅ LinkedIn JD2CV Supabase popup script fully initialized');