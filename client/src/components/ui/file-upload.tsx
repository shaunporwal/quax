import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  onMultipleFilesChange?: (files: File[]) => void;
  file: File | null;
  multipleFiles?: File[];
  allowMultiple?: boolean;
  disabled?: boolean;
}

// Valid file types for OpenAI Vision
const VALID_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export function FileUpload({ 
  onFileChange, 
  onMultipleFilesChange, 
  file, 
  multipleFiles = [], 
  allowMultiple = false, 
  disabled = false 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    setFileError(null);
    if (!VALID_FILE_TYPES.includes(file.type)) {
      setFileError('Please upload a PDF or image file (JPEG, PNG, GIF, WEBP)');
      return false;
    }
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (disabled) return;
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (allowMultiple && onMultipleFilesChange && e.dataTransfer.files.length > 1) {
          // Handle multiple files dropped
          const validFiles: File[] = [];
          
          // Check each file for validity
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            const file = e.dataTransfer.files[i];
            if (validateFile(file)) {
              validFiles.push(file);
            }
          }
          
          if (validFiles.length > 0) {
            onMultipleFilesChange(validFiles);
            // Also set the first file as the current file for display
            onFileChange(validFiles[0]);
          } else {
            onFileChange(null);
          }
        } else {
          // Single file drop handling (default behavior)
          const droppedFile = e.dataTransfer.files[0];
          if (validateFile(droppedFile)) {
            onFileChange(droppedFile);
          } else {
            onFileChange(null);
          }
        }
      }
    },
    [onFileChange, onMultipleFilesChange, allowMultiple, disabled]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        if (allowMultiple && onMultipleFilesChange && e.target.files.length > 1) {
          // Handle multiple files
          const validFiles: File[] = [];
          
          // Check each file for validity
          for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            if (validateFile(file)) {
              validFiles.push(file);
            }
          }
          
          if (validFiles.length > 0) {
            onMultipleFilesChange(validFiles);
            // Also set the first file as the current file for display
            onFileChange(validFiles[0]);
          } else {
            onFileChange(null);
          }
        } else {
          // Single file handling (default behavior)
          const selectedFile = e.target.files[0];
          if (validateFile(selectedFile)) {
            onFileChange(selectedFile);
          } else {
            onFileChange(null);
          }
        }
      }
    },
    [onFileChange, onMultipleFilesChange, allowMultiple]
  );

  const handleRemoveFile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileChange(null);
      // Also clear multiple files if handler is provided
      if (onMultipleFilesChange) {
        onMultipleFilesChange([]);
      }
      setFileError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFileChange, onMultipleFilesChange]
  );

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-2">Upload W2 Form</h2>
      
      {!file ? (
        <Card 
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition ${
            isDragging ? 'border-primary bg-primary/5' : 'border-neutral-200'
          } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center gap-2 p-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-neutral-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M12 11v6" />
              <path d="m9 14 3-3 3 3" />
            </svg>
            <p>Drag and drop your W2 form here, or click to browse</p>
            <p className="text-xs text-neutral-500 mb-1">Accept PDF or image files (JPG, PNG, GIF, WEBP)</p>
            <p className="text-xs font-medium text-amber-600">⭐ For best results, use PNG or JPEG images of your W2</p>
            {allowMultiple && (
              <p className="text-xs font-medium text-primary mt-1">✓ Multiple files can be selected at once</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">PDF analysis has limitations with OpenAI Vision API</p>
          </CardContent>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={disabled}
            multiple={allowMultiple}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Display a simplified control bar with file count and remove button */}
          <div className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-primary"
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
              <div>
                <p className="font-medium text-sm">
                  {allowMultiple && multipleFiles && multipleFiles.length > 0 
                    ? `${multipleFiles.length} file${multipleFiles.length > 1 ? 's' : ''} selected`
                    : file.name
                  }
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRemoveFile}
              disabled={disabled}
              className="text-neutral-500 hover:text-destructive h-8 w-8"
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
              <span className="sr-only">Remove files</span>
            </Button>
          </div>
          
          {/* PDF warning - only show if at least one PDF is detected */}
          {(file.type === 'application/pdf' || 
            (multipleFiles && multipleFiles.some(f => f.type === 'application/pdf'))) && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
              <p className="text-xs text-amber-800 font-medium flex items-center">
                <span className="mr-1">⚠️</span> 
                PDF format detected. For more accurate results, consider converting your W2 to an image file (PNG/JPEG).
              </p>
            </div>
          )}
          
          {/* Display all files in a unified list */}
          {allowMultiple && multipleFiles && multipleFiles.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium mb-1">All Files ({multipleFiles.length})</p>
              <div className="max-h-52 overflow-y-auto border rounded-md p-2">
                {multipleFiles.map((fileItem, index) => (
                  <div key={index} className="flex items-center justify-between py-1 border-b last:border-0">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 mr-2 ${fileItem.type === 'application/pdf' ? 'text-amber-500' : 'text-primary'}`}
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
                      <div className="text-xs">
                        <p className="font-medium truncate w-48">{fileItem.name}</p>
                        <p className="text-neutral-500">{getFileSize(fileItem.size)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
