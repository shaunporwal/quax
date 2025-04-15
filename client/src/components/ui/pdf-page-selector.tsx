import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PdfPageSelectorProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function PdfPageSelector({
  pageCount,
  currentPage,
  onPageChange,
  disabled = false
}: PdfPageSelectorProps) {
  if (pageCount <= 1) {
    return null; // Don't show the selector for single-page PDFs
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pageCount) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">PDF Page Navigation</h3>
          <span className="text-xs text-muted-foreground">
            {pageCount} {pageCount === 1 ? 'page' : 'pages'} total
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={disabled || currentPage <= 1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Previous
          </Button>
          
          <span className="text-sm font-medium mx-2">
            Page {currentPage} of {pageCount}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={disabled || currentPage >= pageCount}
          >
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          For multi-page W2 PDFs, navigate to the page containing your W2 form before extraction.
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs font-medium text-yellow-800">
            <span className="mr-1">⚠️</span> 
            PDF support is experimental. For best results, consider uploading a PNG or JPEG image of your W2 form.
          </p>
        </div>
      </div>
    </Card>
  );
}