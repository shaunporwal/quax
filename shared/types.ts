// W2 Data interface - represents all the fields we need to extract from W2 forms
export interface W2Data {
  // General Information
  employerName: string;
  employerEIN: string;
  employeeName: string;
  employeeSSN: string; // Only last 4 digits for privacy
  
  // Federal Income
  box1: string; // Wages, tips, other compensation
  box2: string; // Federal income tax withheld
  box3: string; // Social Security wages
  box4: string; // Social Security tax withheld
  box5: string; // Medicare wages and tips
  box6: string; // Medicare tax withheld
  
  // State Income
  box15: string; // State
  box16: string; // State wages, tips, etc.
  box17: string; // State income tax
  
  // Local Income
  box18: string; // Local wages, tips, etc.
  box19: string; // Local income tax
  box20: string; // Locality name
}

// Settings interface
export interface ExtensionSettings {
  apiKey: string;
  saveApiKey: boolean;
  useOpenAI: boolean;
  autoDetectForms: boolean;
  askBeforeFilling: boolean;
  clearDataOnClose: boolean;
}

// API Response from OpenAI for W2 extraction
export interface OpenAIW2Response {
  employerName: string;
  employerEIN: string;
  employeeName: string;
  employeeSSN: string;
  box1: string;
  box2: string;
  box3: string;
  box4: string;
  box5: string;
  box6: string;
  box15: string;
  box16: string;
  box17: string;
  box18: string;
  box19: string;
  box20: string;
}
