/**
 * Monster to JD2CV Supabase Content Script
 * Extracts job data from Monster.com and provides sync functionality
 */

console.log('🔄 Monster JD2CV Supabase Content Script - Starting');

// Monster job data extraction
function extractMonsterJobData() {
  try {
    // Extract from JSON-LD structured data
    const jsonScript = document.querySelector('#googleJsonJob');
    if (!jsonScript) {
      throw new Error('No JSON-LD structured data found');
    }
    
    const jobData = JSON.parse(jsonScript.textContent);
    
    // Clean HTML from description
    const cleanDescription = jobData.description
      ?.replace(/<[^>]*>/g, '') // Remove HTML tags
      ?.replace(/&nbsp;/g, ' ') // Replace &nbsp;
      ?.replace(/&amp;/g, '&') // Replace &amp;
      ?.replace(/&lt;/g, '<') // Replace &lt;
      ?.replace(/&gt;/g, '>') // Replace &gt;
      ?.replace(/&quot;/g, '"') // Replace &quot;
      ?.replace(/\s+/g, ' ') // Normalize whitespace
      ?.trim();
    
    const extractedData = {
      title: jobData.title || '',
      company: jobData.hiringOrganization?.name || '',
      full_job_description: cleanDescription || '',
      url: jobData.url || window.location.href,
      source: 'monster.com'
    };
    
    console.log('📤 Monster job data extracted:', {
      title: extractedData.title,
      company: extractedData.company,
      descriptionLength: extractedData.full_job_description.length,
      url: extractedData.url
    });
    
    return extractedData;
  } catch (error) {
    console.error('❌ Error extracting Monster job data:', error);
    throw error;
  }
}

// Create and inject sync button
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

// Initialize sync functionality
function initializeSync() {
  try {
    // Find the save button container
    const saveButton = document.querySelector('[data-testid="job-save-button"]');
    if (!saveButton) {
      console.warn('⚠️ Monster save button not found');
      return;
    }
    
    const container = saveButton.parentElement;
    if (!container) {
      console.warn('⚠️ Save button container not found');
      return;
    }
    
    // Check if our button already exists
    if (container.querySelector('.monster-jd2cv-sync-button')) {
      return;
    }
    
    // Create and add sync button
    const syncButton = createSyncButton();
    syncButton.className = 'monster-jd2cv-sync-button';
    
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
        if (!document.querySelector('#monster-sync-spinner-style')) {
          const style = document.createElement('style');
          style.id = 'monster-sync-spinner-style';
          style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
          document.head.appendChild(style);
        }
        
        // Extract job data
        const jobData = extractMonsterJobData();
        
        // Send to background script
        const response = await chrome.runtime.sendMessage({
          action: 'SYNC_MONSTER_JOB_TO_SUPABASE',
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
    console.log('✅ Monster JD2CV sync button added');
    
  } catch (error) {
    console.error('❌ Error initializing sync:', error);
  }
}

// Wait for page to load and initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeSync, 1000);
  });
} else {
  setTimeout(initializeSync, 1000);
}

// Also try to initialize on URL changes (SPA navigation)
let currentUrl = location.href;
new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    setTimeout(initializeSync, 1500);
  }
}).observe(document, { subtree: true, childList: true });

console.log('✅ Monster JD2CV Supabase content script loaded');