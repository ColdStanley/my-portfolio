/**
 * LinkedIn Data Extractor - Content Script for JD2CV Supabase Sync
 * Extracts job posting data from LinkedIn job pages and monitors save button clicks
 */

console.log('🔗 LinkedIn JD2CV Supabase Sync - Content Script Loaded');
console.log('🔗 Current URL:', window.location.href);
console.log('🔗 Page title:', document.title);

// LinkedIn job data selectors based on analysis
const LINKEDIN_SELECTORS = {
  JOB_TITLE: '.job-details-jobs-unified-top-card__job-title h1 a',
  COMPANY_NAME: '.job-details-jobs-unified-top-card__company-name a',
  JOB_DESCRIPTION: '.jobs-description__content .jobs-description-content__text--stretch',
  SAVE_BUTTON: '.jobs-save-button',
  EASY_APPLY_BUTTON: '#jobs-apply-button-id'
};

/**
 * Convert HTML content to formatted text preserving structure
 */
function htmlToFormattedText(element) {
  if (!element) return '';
  
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true);
  
  // Replace HTML elements with appropriate text formatting
  const replacements = [
    { tag: 'br', replacement: '\n' },
    { tag: 'p', replacement: '\n\n', closing: '\n' },
    { tag: 'div', replacement: '\n', closing: '' },
    { tag: 'li', replacement: '\n• ', closing: '' },
    { tag: 'ul', replacement: '\n', closing: '\n' },
    { tag: 'ol', replacement: '\n', closing: '\n' },
    { tag: 'h1', replacement: '\n\n', closing: '\n' },
    { tag: 'h2', replacement: '\n\n', closing: '\n' },
    { tag: 'h3', replacement: '\n\n', closing: '\n' }
  ];
  
  // Apply replacements
  replacements.forEach(({ tag, replacement, closing = '' }) => {
    const elements = clone.querySelectorAll(tag);
    elements.forEach(el => {
      if (tag === 'br') {
        el.replaceWith(document.createTextNode(replacement));
      } else {
        const text = el.textContent;
        el.replaceWith(document.createTextNode(replacement + text + closing));
      }
    });
  });
  
  return clone.textContent
    .replace(/\n\n\n+/g, '\n\n')  // Normalize multiple line breaks
    .replace(/^\n+|\n+$/g, '')    // Remove leading/trailing line breaks
    .trim();
}

/**
 * Extract job data from current LinkedIn page
 */
function extractLinkedInJobData() {
  try {
    const jobTitle = document.querySelector(LINKEDIN_SELECTORS.JOB_TITLE)?.textContent?.trim() || '';
    const companyName = document.querySelector(LINKEDIN_SELECTORS.COMPANY_NAME)?.textContent?.trim() || '';
    const jobDescriptionElement = document.querySelector(LINKEDIN_SELECTORS.JOB_DESCRIPTION);
    const jobDescription = htmlToFormattedText(jobDescriptionElement);

    // Validate required fields
    if (!jobTitle || !companyName) {
      console.warn('⚠️ LinkedIn Sync: Missing required job data (title or company)');
      return null;
    }

    // Detect Easy Apply and get LinkedIn URL
    // Check aria-label to differentiate between "Easy Apply" and "Apply on company website"
    const applyButton = document.querySelector(LINKEDIN_SELECTORS.EASY_APPLY_BUTTON);
    const isEasyApply = applyButton && (
      applyButton.getAttribute('aria-label')?.includes('Easy Apply') ||
      applyButton.textContent.trim() === 'Easy Apply'
    );
    const url = window.location.href;

    const jobData = {
      title: jobTitle,
      company: companyName,
      full_job_description: jobDescription,
      jd_link: url,
      comment: isEasyApply ? 'Easy Apply' : ''
    };

    console.log('✅ LinkedIn job data extracted:', {
      title: jobData.title,
      company: jobData.company,
      descriptionLength: jobData.full_job_description.length,
      isEasyApply: isEasyApply,
      linkedinUrl: jobData.jd_link,
      comment: jobData.comment
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
        action: 'SYNC_LINKEDIN_JOB_TO_SUPABASE',
        data: jobData
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Failed to send message to background script:', chrome.runtime.lastError);
        } else {
          console.log('📤 Job data sent to background script for Supabase sync');
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
 * Create and inject sync button (Monster-style enhancement)
 */
function createSyncButton() {
  const button = document.createElement('button');
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
    Save to JD2CV
  `;
  
  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    margin-left: 12px;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
  `;
  
  // Hover effects
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-1px)';
    button.style.boxShadow = '0 4px 8px rgba(124, 58, 237, 0.3)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 2px 4px rgba(124, 58, 237, 0.2)';
  });
  
  return button;
}

/**
 * Initialize LinkedIn sync button injection
 */
function initializeLinkedInSyncButton() {
  try {
    // Find the LinkedIn save button
    const saveButton = document.querySelector(LINKEDIN_SELECTORS.SAVE_BUTTON);
    if (!saveButton) {
      console.warn('⚠️ LinkedIn save button not found');
      return;
    }
    
    const container = saveButton.parentElement;
    if (!container) {
      console.warn('⚠️ Save button container not found');
      return;
    }
    
    // Check if our button already exists
    if (container.querySelector('.linkedin-jd2cv-sync-button')) {
      return;
    }
    
    // Create and add sync button
    const syncButton = createSyncButton();
    syncButton.className = 'linkedin-jd2cv-sync-button';
    
    syncButton.addEventListener('click', async () => {
      try {
        // Update button state
        const originalText = syncButton.innerHTML;
        syncButton.innerHTML = `
          <div style="width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid currentColor; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;"></div>
          Syncing...
        `;
        syncButton.style.pointerEvents = 'none';
        
        // Add spin animation
        if (!document.querySelector('#linkedin-sync-spinner-style')) {
          const style = document.createElement('style');
          style.id = 'linkedin-sync-spinner-style';
          style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
          document.head.appendChild(style);
        }
        
        // Extract job data
        const jobData = extractLinkedInJobData();
        
        if (!jobData) {
          throw new Error('Failed to extract job data');
        }
        
        // Send to background script
        const response = await chrome.runtime.sendMessage({
          action: 'SYNC_LINKEDIN_JOB_TO_SUPABASE',
          data: jobData
        });
        
        if (response && response.success) {
          syncButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Saved!
          `;
          syncButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          
          // Reset button after 3 seconds
          setTimeout(() => {
            syncButton.innerHTML = originalText;
            syncButton.style.background = 'linear-gradient(135deg, #7c3aed, #3b82f6)';
            syncButton.style.pointerEvents = 'auto';
          }, 3000);
        } else {
          throw new Error(response?.error || 'Sync failed');
        }
      } catch (error) {
        console.error('❌ Sync failed:', error);
        syncButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Error
        `;
        syncButton.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        
        // Reset after 3 seconds
        setTimeout(() => {
          syncButton.innerHTML = originalText;
          syncButton.style.background = 'linear-gradient(135deg, #7c3aed, #3b82f6)';
          syncButton.style.pointerEvents = 'auto';
        }, 3000);
      }
    });
    
    container.appendChild(syncButton);
    console.log('✅ LinkedIn JD2CV sync button added');
    
  } catch (error) {
    console.error('❌ Error initializing LinkedIn sync button:', error);
  }
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
  document.addEventListener('DOMContentLoaded', () => {
    initializeSaveButtonMonitoring();
    setTimeout(initializeLinkedInSyncButton, 1000);
  });
} else {
  initializeSaveButtonMonitoring();
  setTimeout(initializeLinkedInSyncButton, 1000);
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

// Monitor URL changes for SPA navigation (LinkedIn is a SPA)
let currentUrl = location.href;
new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    console.log('🔗 LinkedIn URL changed, re-initializing sync button...');
    setTimeout(initializeLinkedInSyncButton, 1500);
  }
}).observe(document, { subtree: true, childList: true });

console.log('✅ LinkedIn data extractor fully initialized');