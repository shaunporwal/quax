/**
 * W2 Autofill Content Script
 * Detects and fills tax form fields on popular tax websites
 */

// Common field patterns to look for
const fieldMappings = {
  // Federal income info
  'wages': ['box1', 'wages', 'compensation', 'income'],
  'federal_withheld': ['box2', 'federal', 'withheld', 'tax'],
  'ss_wages': ['box3', 'social security', 'wages', 'ss wages'],
  'ss_tax_withheld': ['box4', 'social security tax', 'ss tax', 'withheld'],
  'medicare_wages': ['box5', 'medicare', 'wages', 'medicare wages'],
  'medicare_tax_withheld': ['box6', 'medicare tax', 'withheld'],
  
  // Employer info
  'employer_name': ['employer', 'company', 'business', 'name'],
  'employer_ein': ['ein', 'employer id', 'tax id'],
  
  // Employee info
  'employee_name': ['your name', 'employee', 'name'],
  'employee_ssn': ['ssn', 'social security', 'number'],
  
  // State info
  'state_code': ['box15', 'state', 'state code'],
  'state_wages': ['box16', 'state wages', 'state income'],
  'state_tax': ['box17', 'state tax', 'state income tax'],
  
  // Local info
  'local_wages': ['box18', 'local wages', 'local income'],
  'local_tax': ['box19', 'local tax', 'local income tax'],
  'locality_name': ['box20', 'locality', 'city', 'county']
};

// Map field keys to W2 data property names
const w2DataMapping = {
  'wages': 'box1',
  'federal_withheld': 'box2',
  'ss_wages': 'box3',
  'ss_tax_withheld': 'box4',
  'medicare_wages': 'box5',
  'medicare_tax_withheld': 'box6',
  'employer_name': 'employerName',
  'employer_ein': 'employerEIN',
  'employee_name': 'employeeName',
  'employee_ssn': 'employeeSSN',
  'state_code': 'box15',
  'state_wages': 'box16',
  'state_tax': 'box17',
  'local_wages': 'box18',
  'local_tax': 'box19',
  'locality_name': 'box20'
};

/**
 * Find form fields that might be tax-related
 */
function findFormFields() {
  const fields = {};
  
  // Get all input fields in the document
  const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input:not([type])');
  
  inputs.forEach(input => {
    const fieldId = input.id?.toLowerCase() || '';
    const fieldName = input.name?.toLowerCase() || '';
    const fieldLabel = getInputLabel(input)?.toLowerCase() || '';
    const fieldPlaceholder = input.placeholder?.toLowerCase() || '';
    
    // Check against each field mapping
    for (const [fieldKey, patterns] of Object.entries(fieldMappings)) {
      if (!fields[fieldKey] && matchesAnyPattern(fieldId, fieldName, fieldLabel, fieldPlaceholder, patterns)) {
        fields[fieldKey] = input;
      }
    }
  });
  
  return fields;
}

/**
 * Try to find a label for an input field
 */
function getInputLabel(input) {
  // Try to find a label with a "for" attribute
  const label = document.querySelector(`label[for="${input.id}"]`);
  if (label) return label.textContent.trim();
  
  // Try to find a parent label
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent.trim();
  
  // Try to find a preceding div that might contain a label-like text
  const parentDiv = input.parentElement;
  if (parentDiv) {
    const labelLikeElements = parentDiv.querySelectorAll('span, div, p');
    for (const el of labelLikeElements) {
      const text = el.textContent.trim();
      if (text && text.length < 50) { // Likely a label if it's short text
        return text;
      }
    }
  }
  
  return null;
}

/**
 * Check if any of the field attributes match any of the patterns
 */
function matchesAnyPattern(fieldId, fieldName, fieldLabel, fieldPlaceholder, patterns) {
  for (const pattern of patterns) {
    const patternRegex = new RegExp(pattern, 'i');
    
    if (
      patternRegex.test(fieldId) ||
      patternRegex.test(fieldName) ||
      patternRegex.test(fieldLabel) ||
      patternRegex.test(fieldPlaceholder)
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Fill fields with W2 data
 */
function fillFormFields(fields, w2Data) {
  let filledCount = 0;
  
  for (const [fieldKey, inputElement] of Object.entries(fields)) {
    const w2Property = w2DataMapping[fieldKey];
    
    if (w2Property && w2Data[w2Property]) {
      // Extract just the numerical value for dollar amounts
      if (w2Data[w2Property].includes('$')) {
        const numericValue = w2Data[w2Property].replace(/[$,]/g, '');
        inputElement.value = numericValue;
      } else {
        inputElement.value = w2Data[w2Property];
      }
      
      // Trigger input event to notify the form of changes
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      filledCount++;
    }
  }
  
  return filledCount;
}

/**
 * Create and show the autofill button
 */
function createAutofillButton(w2Data) {
  // Remove any existing button
  const existingButton = document.getElementById('w2-autofill-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Create the button container
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'w2-autofill-button';
  buttonContainer.style.position = 'fixed';
  buttonContainer.style.bottom = '20px';
  buttonContainer.style.right = '20px';
  buttonContainer.style.zIndex = '10000';
  
  // Create the button
  const button = document.createElement('button');
  button.textContent = 'Autofill W2 Data';
  button.style.backgroundColor = '#1A73E8';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.padding = '8px 16px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.fontFamily = 'Arial, sans-serif';
  button.style.fontWeight = 'bold';
  
  // Add an icon
  const icon = document.createElement('span');
  icon.textContent = '📝';
  icon.style.marginRight = '8px';
  button.prepend(icon);
  
  // Add hover effect
  button.onmouseover = () => {
    button.style.backgroundColor = '#0B5CCA';
  };
  button.onmouseout = () => {
    button.style.backgroundColor = '#1A73E8';
  };
  
  // Add click event
  button.onclick = () => {
    const fields = findFormFields();
    const filledCount = fillFormFields(fields, w2Data);
    
    const resultMessage = document.createElement('div');
    resultMessage.textContent = `${filledCount} fields filled with W2 data`;
    resultMessage.style.backgroundColor = '#34A853';
    resultMessage.style.color = 'white';
    resultMessage.style.borderRadius = '4px';
    resultMessage.style.padding = '8px 16px';
    resultMessage.style.marginTop = '8px';
    resultMessage.style.textAlign = 'center';
    
    buttonContainer.appendChild(resultMessage);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
      resultMessage.remove();
    }, 3000);
  };
  
  buttonContainer.appendChild(button);
  document.body.appendChild(buttonContainer);
}

/**
 * Main content script functionality
 */
(function() {
  // Check for settings
  chrome.storage.local.get(['w2_autofill_settings', 'w2_autofill_data'], (result) => {
    const settings = result.w2_autofill_settings || {};
    const w2Data = result.w2_autofill_data;
    
    // Only proceed if we have W2 data and auto-detect is enabled
    if (w2Data && (settings.autoDetectForms !== false)) {
      // Create the autofill button
      createAutofillButton(w2Data);
      
      // If auto-fill without asking is enabled, automatically fill forms
      if (settings.askBeforeFilling === false) {
        const fields = findFormFields();
        fillFormFields(fields, w2Data);
      }
    }
  });
  
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillW2Data' && message.data) {
      const fields = findFormFields();
      const filledCount = fillFormFields(fields, message.data);
      sendResponse({ success: true, filledCount });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  });
})();
