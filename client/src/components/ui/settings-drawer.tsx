import { ExtensionSettings } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ExtensionSettings;
  onSettingsChange: (settings: Partial<ExtensionSettings>) => void;
}

export function SettingsDrawer({ isOpen, onClose, settings, onSettingsChange }: SettingsDrawerProps) {
  return (
    <div 
      className={`fixed inset-y-0 right-0 bg-white shadow-lg w-80 transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-neutral-200">
        <h2 className="text-lg font-medium">Settings</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8 rounded-full"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span className="sr-only">Close settings</span>
        </Button>
      </div>
      
      <div className="p-4 overflow-y-auto h-full pb-24">
        <div className="mb-5">
          <h3 className="font-medium mb-2">Extraction Method</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="useOpenAI" className="text-sm">Use OpenAI GPT-4.1 Vision</Label>
            <Switch 
              id="useOpenAI"
              checked={settings.useOpenAI}
              onCheckedChange={(checked) => onSettingsChange({ useOpenAI: checked })}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">Provides the most accurate extraction of W2 data</p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="mb-5">
          <h3 className="font-medium mb-2">Autofill Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoDetectForms" className="text-sm">Auto-detect tax forms</Label>
              <Switch 
                id="autoDetectForms"
                checked={settings.autoDetectForms}
                onCheckedChange={(checked) => onSettingsChange({ autoDetectForms: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="askBeforeFilling" className="text-sm">Ask before filling forms</Label>
              <Switch 
                id="askBeforeFilling"
                checked={settings.askBeforeFilling}
                onCheckedChange={(checked) => onSettingsChange({ askBeforeFilling: checked })}
              />
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="mb-5">
          <h3 className="font-medium mb-2">Privacy</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="clearDataOnClose" className="text-sm">Clear data when browser closes</Label>
            <Switch 
              id="clearDataOnClose"
              checked={settings.clearDataOnClose}
              onCheckedChange={(checked) => onSettingsChange({ clearDataOnClose: checked })}
            />
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="font-medium mb-2">About</h3>
          <p className="text-sm text-neutral-500">W2 Autofill Extension v1.0.0</p>
          <div className="flex mt-2">
            <a href="#" className="text-primary text-sm mr-4">Privacy Policy</a>
            <a href="#" className="text-primary text-sm">Help Center</a>
          </div>
        </div>
      </div>
    </div>
  );
}
