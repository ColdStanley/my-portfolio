/**
 * LinkedIn Data Extractor - Content Script
 * Extracts job posting data from LinkedIn job pages and monitors save button clicks
 */

console.log('🔗 LinkedIn to Notion JD2CV Sync - Content Script Loaded');

// LinkedIn job data selectors based on analysis
const LINKEDIN_SELECTORS = {
  JOB_TITLE: '.job-details-jobs-unified-top-card__job-title h1 a',
  COMPANY_NAME: '.job-details-jobs-unified-top-card__company-name a',
  JOB_DESCRIPTION: '.jobs-description__content .jobs-description-content__text--stretch',
  SAVE_BUTTON: '.jobs-save-button',
  LOCATION: '.job-details-jobs-unified-top-card__primary-description-container .jobs-unified-top-card__bullet'
};

/**
 * Extract job data from current LinkedIn page
 */
function extractLinkedInJobData() {
  try {
    const jobTitle = document.querySelector(LINKEDIN_SELECTORS.JOB_TITLE)?.textContent?.trim() || '';
    const companyName = document.querySelector(LINKEDIN_SELECTORS.COMPANY_NAME)?.textContent?.trim() || '';
    const jobDescription = document.querySelector(LINKEDIN_SELECTORS.JOB_DESCRIPTION)?.textContent?.trim() || '';
    const location = document.querySelector(LINKEDIN_SELECTORS.LOCATION)?.textContent?.trim() || '';
    const currentUrl = window.location.href;
    const extractedAt = new Date().toISOString();

    // Validate required fields
    if (!jobTitle || !companyName) {
      console.warn('⚠️ LinkedIn Sync: Missing required job data (title or company)');
      return null;
    }

    const jobData = {
      title: jobTitle,
      company: companyName,
      full_job_description: jobDescription,
      location: location,
      linkedin_url: currentUrl,
      extracted_at: extractedAt,
      application_stage: 'Saved' // Default status when saved from LinkedIn
    };

    console.log('✅ LinkedIn job data extracted:', {
      title: jobData.title,
      company: jobData.company,
      descriptionLength: jobData.full_job_description.length,
      location: jobData.location
    });

    return jobData;
  } catch (error) {
    console.error('❌ Error extracting LinkedIn job data:', error);
    return null;
  }
}

/**
 * Handle save button click event
 */
function handleSaveButtonClick(event) {
  console.log('💾 LinkedIn Save button clicked - extracting job data...');
  
  // Small delay to ensure page is fully loaded
  setTimeout(() => {
    const jobData = extractLinkedInJobData();
    
    if (jobData) {
      // Send extracted data to background script
      chrome.runtime.sendMessage({
        action: 'SYNC_LINKEDIN_JOB_TO_NOTION',
        data: jobData
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Failed to send message to background script:', chrome.runtime.lastError);
        } else {
          console.log('📤 Job data sent to background script for Notion sync');
        }
      });
    } else {
      console.warn('⚠️ No valid job data extracted, skipping sync');
    }
  }, 500);
}

/**
 * Set up save button monitoring
 */
function initializeSaveButtonMonitoring() {
  // Direct click listener on save button
  document.addEventListener('click', (event) => {
    const saveButton = event.target.closest(LINKEDIN_SELECTORS.SAVE_BUTTON);
    if (saveButton) {
      handleSaveButtonClick(event);
    }
  });

  // Observer for dynamically loaded save buttons
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const saveButton = node.querySelector && node.querySelector(LINKEDIN_SELECTORS.SAVE_BUTTON);
          if (saveButton) {
            console.log('🔍 Save button detected via observer');
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('👂 LinkedIn save button monitoring initialized');
}

/**
 * Test data extraction (for debugging)
 */
function testDataExtraction() {
  const jobData = extractLinkedInJobData();
  if (jobData) {
    console.log('🧪 Test extraction successful:', jobData);
  } else {
    console.log('🧪 Test extraction failed - not on a job page or missing data');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSaveButtonMonitoring);
} else {
  initializeSaveButtonMonitoring();
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'TEST_EXTRACTION':
      testDataExtraction();
      sendResponse({ success: true });
      break;
    case 'EXTRACT_CURRENT_JOB':
      const jobData = extractLinkedInJobData();
      sendResponse({ success: !!jobData, data: jobData });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

console.log('✅ LinkedIn data extractor fully initialized');