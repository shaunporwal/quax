import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ApiKeyInputProps {
  apiKey: string;
  saveApiKey: boolean;
  onApiKeyChange: (apiKey: string) => void;
  onSaveApiKeyChange: (save: boolean) => void;
  disabled?: boolean;
}

export function ApiKeyInput({
  apiKey,
  saveApiKey,
  onApiKeyChange,
  onSaveApiKeyChange,
  disabled = false
}: ApiKeyInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Show "Saved" indicator briefly when the save toggle is activated
  useEffect(() => {
    if (saveApiKey && apiKey) {
      setIsSaved(true);
      const timer = setTimeout(() => setIsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveApiKey, apiKey]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">OpenAI API Key</h2>
        {isSaved && (
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Saved
          </span>
        )}
      </div>

      <Card className="bg-white rounded-lg">
        <CardContent className="pt-4">
          <div className="relative">
            <Input
              type={isVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="pr-9"
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-neutral-500"
              onClick={toggleVisibility}
              disabled={disabled}
            >
              {isVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
              <span className="sr-only">Toggle visibility</span>
            </Button>
          </div>

          <div className="flex items-center mt-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="save-api-key"
                checked={saveApiKey}
                onCheckedChange={onSaveApiKeyChange}
                disabled={disabled}
              />
              <Label htmlFor="save-api-key" className="text-sm">
                Save API key in browser storage
              </Label>
            </div>
          </div>

          <p className="mt-2 text-xs text-neutral-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Your API key is only used for W2 data extraction with OpenAI
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
