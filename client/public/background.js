/**
 * W2 Autofill Background Script
 * Handles background tasks for the extension
 */

// Listen for installation or update
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Initialize settings on install
    const defaultSettings = {
      apiKey: '',
      saveApiKey: false,
      useOpenAI: true,
      autoDetectForms: true,
      askBeforeFilling: true,
      clearDataOnClose: false
    };
    
    chrome.storage.local.set({ 'w2_autofill_settings': defaultSettings });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getActiveTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true; // Required for async response
  }
  
  if (message.action === 'fillW2DataInTab' && message.data) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'fillW2Data', data: message.data },
          (response) => {
            sendResponse(response);
          }
        );
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Required for async response
  }
});

// Clear data on browser close if setting enabled
chrome.storage.local.get('w2_autofill_settings', (result) => {
  const settings = result.w2_autofill_settings || {};
  
  if (settings.clearDataOnClose) {
    chrome.windows.onRemoved.addListener(() => {
      chrome.windows.getAll((windows) => {
        if (windows.length === 0) {
          // No windows left, clear the data
          chrome.storage.local.remove([
            'w2_autofill_data',
            'w2_autofill_api_key'
          ]);
        }
      });
    });
  }
});
