import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { ApiKeyInput } from '@/components/ui/api-key-input';
import { ResultsDisplay } from '@/components/ui/results-display';
import { SettingsDrawer } from '@/components/ui/settings-drawer';
import { ErrorAlert } from '@/components/ui/error-alert';
import { HelpSection } from '@/components/ui/help-section';
import { PdfPageSelector } from '@/components/ui/pdf-page-selector';
import { Button } from '@/components/ui/button';
import { useW2Extraction } from '@/hooks/use-w2-extraction';
import { ExtensionSettings, W2Data } from '@shared/types';
import { loadApiKey, saveApiKey, loadSettings, saveSettings, loadW2Data } from '@/lib/chromeStorage';
import { defaultSettings } from '@/lib/chromeStorage';

export default function ExtensionPopup() {
  // State management
  const [apiKey, setApiKey] = useState('');
  const [saveApiKeyState, setSaveApiKeyState] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);
  const [statusMessage, setStatusMessage] = useState('Ready to process your W2 form');
  
  // W2 extraction hook
  const { 
    file, 
    multipleFiles,
    isExtracting, 
    extractedData, 
    error,
    pdfPageCount,
    selectedPage,
    handleFileChange,
    handleMultipleFilesChange,
    extractW2Data,
    extractW2DataFromPage,
    setPage,
    clearData,
    clearError
  } = useW2Extraction();

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load API key
        const savedApiKey = await loadApiKey();
        if (savedApiKey) {
          setApiKey(savedApiKey);
          setSaveApiKeyState(true);
        }
        
        // Load settings
        const savedSettings = await loadSettings();
        setSettings(savedSettings);
        
        // Load previously extracted W2 data
        const savedW2Data = await loadW2Data();
        if (savedW2Data) {
          setStatusMessage('Previously extracted W2 data loaded');
        }
      } catch (err) {
        console.error('Failed to load saved data:', err);
      }
    };
    
    loadSavedData();
  }, []);

  // Handle API key changes
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  // Handle save API key toggle
  const handleSaveApiKeyChange = async (save: boolean) => {
    setSaveApiKeyState(save);
    
    if (save && apiKey) {
      await saveApiKey(apiKey);
    }
  };

  // Handle settings changes
  const handleSettingsChange = async (newSettings: Partial<ExtensionSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  // Handle extract button click
  const handleExtract = async () => {
    if (file?.type === 'application/pdf' && pdfPageCount > 1) {
      setStatusMessage(`Processing page ${selectedPage} of ${pdfPageCount} with OpenAI...`);
    } else if (multipleFiles.length > 1) {
      setStatusMessage(`Processing ${multipleFiles.length} files with OpenAI...`);
    } else {
      setStatusMessage('Processing W2 data with OpenAI...');
    }
    
    await extractW2Data(apiKey);
    
    if (file?.type === 'application/pdf' && pdfPageCount > 1) {
      setStatusMessage(`W2 data extracted successfully from page ${selectedPage}`);
    } else if (multipleFiles.length > 1) {
      setStatusMessage(`Successfully processed ${multipleFiles.length} files and combined the data`);
    } else {
      setStatusMessage('W2 data extracted successfully');
    }
  };

  // Handle copy all data
  const handleCopyAllData = async () => {
    if (!extractedData) return;
    
    try {
      const formattedData = Object.entries(extractedData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      await navigator.clipboard.writeText(formattedData);
      setStatusMessage('All W2 data copied to clipboard');
      
      // Reset status message after 2 seconds
      setTimeout(() => {
        setStatusMessage('W2 data extracted successfully');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy data:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
            </svg>
            W2 Autofill
          </h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full text-white hover:bg-white/10"
            onClick={() => setIsSettingsOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        {/* File Upload */}
        <FileUpload 
          onFileChange={handleFileChange}
          onMultipleFilesChange={handleMultipleFilesChange}
          file={file}
          multipleFiles={multipleFiles}
          allowMultiple={true}
          disabled={isExtracting}
        />
        
        {/* PDF Page Selector (only shown for multi-page PDFs) */}
        {file && file.type === 'application/pdf' && pdfPageCount > 1 && (
          <PdfPageSelector
            pageCount={pdfPageCount}
            currentPage={selectedPage}
            onPageChange={setPage}
            disabled={isExtracting}
          />
        )}
        
        {/* API Key Input */}
        <ApiKeyInput 
          apiKey={apiKey} 
          saveApiKey={saveApiKeyState} 
          onApiKeyChange={handleApiKeyChange} 
          onSaveApiKeyChange={handleSaveApiKeyChange}
          disabled={isExtracting}
        />
        
        {/* Extract Button */}
        <div className="mb-6">
          <Button
            className="w-full py-6 text-base font-medium flex items-center justify-center"
            disabled={!file || !apiKey || isExtracting}
            onClick={handleExtract}
          >
            {isExtracting ? (
              <>
                <span>Extracting...</span>
                <div className="ml-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <span>Extract W2 Data</span>
            )}
          </Button>
        </div>
        
        {/* Results Display */}
        {extractedData && (
          <ResultsDisplay 
            data={extractedData} 
            visible={!!extractedData}
          />
        )}
        
        {/* Help Section */}
        <HelpSection />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 p-3 text-center text-xs text-neutral-500">
        <div>{statusMessage}</div>
      </footer>

      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      
      {/* Error Alert */}
      <ErrorAlert 
        error={error} 
        onDismiss={clearError}
      />
    </div>
  );
}
