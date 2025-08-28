/**
 * Monster JD2CV Supabase Sync - Popup Script
 * Handles popup interface interactions and settings management
 */

console.log('🎛️ Monster JD2CV Supabase Sync - Popup Script Loaded');

// DOM Elements
const statusDiv = document.getElementById('status');
const testConnectionBtn = document.getElementById('testConnection');
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
    const response = await chrome.runtime.sendMessage({ action: 'GET_MONSTER_CONFIG' });
    
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
 * Test connection to API
 */
async function testConnection() {
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

  updateStatus('Testing connection...', 'info');
  testConnectionBtn.disabled = true;
  
  try {
    // Test connection by trying to fetch from search endpoint
    const testUrl = `${apiUrl}/api/monster2cv/supabase?user_id=${userId}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      updateStatus(`Connection successful! Found ${result.data?.length || 0} Monster records.`, 'success');
    } else {
      const errorResult = await response.json();
      throw new Error(errorResult.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      updateStatus('Connection failed. Check your API URL and network connection.', 'error');
    } else {
      updateStatus(`Connection failed: ${error.message}`, 'error');
    }
  } finally {
    testConnectionBtn.disabled = false;
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
      action: 'SYNC_MONSTER_JOB_TO_SUPABASE',
      data: currentJobData
    });

    if (response.success) {
      if (response.exists) {
        updateStatus('Job already exists in database', 'info');
      } else {
        updateStatus('Job synced successfully!', 'success');
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
      action: 'UPDATE_MONSTER_API_BASE_URL', 
      url: apiUrl 
    });

    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Failed to update API URL');
    }

    // Update User ID
    const userResponse = await chrome.runtime.sendMessage({ 
      action: 'UPDATE_MONSTER_USER_ID', 
      userId: userId 
    });

    if (!userResponse.success) {
      throw new Error(userResponse.error || 'Failed to update User ID');
    }

    updateStatus('Settings saved successfully!', 'success');
    
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
 * Check if current page is a Monster job page
 */
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.includes('monster.com/job-openings')) {
      updateStatus('Monster job page detected - ready to sync', 'ready');
      testConnectionBtn.textContent = 'Test Connection';
    } else {
      updateStatus('Navigate to Monster job page to sync jobs', 'info');
      testConnectionBtn.textContent = 'Test Connection';
    }
  } catch (error) {
    console.error('❌ Error checking current page:', error);
  }
}

// Event Listeners
testConnectionBtn.addEventListener('click', testConnection);
manualSyncBtn.addEventListener('click', manualSync);
saveSettingsBtn.addEventListener('click', saveSettings);

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎛️ Popup DOM loaded - initializing...');
  
  loadCurrentConfig();
  checkCurrentPage();
});

console.log('✅ Monster JD2CV Supabase popup script fully initialized');