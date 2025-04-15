import { useState } from 'react';
import { W2Data } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ResultsDisplayProps {
  data: W2Data;
  visible: boolean;
}

export function ResultsDisplay({ data, visible }: ResultsDisplayProps) {
  const { toast } = useToast();
  
  const handleCopyAllData = async () => {
    try {
      const formattedData = Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      await navigator.clipboard.writeText(formattedData);
      
      toast({
        title: "Copied to clipboard",
        description: "All W2 data has been copied to clipboard",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy data to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Extracted W2 Data</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary flex items-center"
          onClick={handleCopyAllData}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          Copy All
        </Button>
      </div>

      <Card className="bg-white rounded-lg">
        <CardContent className="p-0">
          {/* Employer & Employee Section */}
          <div className="p-4">
            <h3 className="font-medium mb-2">General Information</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Employer Name</p>
                <p>{data.employerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Employer EIN</p>
                <p>{data.employerEIN || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Employee Name</p>
                <p>{data.employeeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">SSN (Last 4)</p>
                <p>{data.employeeSSN || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Federal Income Section */}
          <div className="p-4">
            <h3 className="font-medium mb-2">Federal Income</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 1: Wages, Tips, Comp.</p>
                <p>{data.box1 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 2: Federal Tax Withheld</p>
                <p>{data.box2 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 3: Social Security Wages</p>
                <p>{data.box3 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 4: SS Tax Withheld</p>
                <p>{data.box4 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 5: Medicare Wages</p>
                <p>{data.box5 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 6: Medicare Tax Withheld</p>
                <p>{data.box6 || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* State Income Section */}
          <div className="p-4">
            <h3 className="font-medium mb-2">State Income</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 15: State</p>
                <p>{data.box15 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 16: State Wages</p>
                <p>{data.box16 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 17: State Tax</p>
                <p>{data.box17 || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Local Income Section */}
          <div className="p-4">
            <h3 className="font-medium mb-2">Local Income</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 18: Local Wages</p>
                <p>{data.box18 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 19: Local Tax</p>
                <p>{data.box19 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Box 20: Locality</p>
                <p>{data.box20 || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
