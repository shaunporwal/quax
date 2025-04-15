import { useState } from 'react';
import { W2Data } from '@shared/types';
import { convertPdfToImage, getPdfPageCount } from '@/lib/pdfProcessing';
import { extractW2DataWithOpenAI, extractW2DataFromMultipleImages, ImageData } from '@/lib/openai';
import { saveW2Data } from '@/lib/chromeStorage';
import { useToast } from '@/hooks/use-toast';

export function useW2Extraction() {
  const [file, setFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<W2Data | null>(null);
  const [error, setError] = useState<{title: string, message: string} | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    // Valid file types for OpenAI Vision
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file && !validTypes.includes(file.type)) {
      setError({
        title: 'Invalid File Type',
        message: 'Please upload a PDF or image file (JPEG, PNG, GIF, WEBP) containing your W2 form.'
      });
      return;
    }
    
    setFile(file);
    setError(null);
    
    // Reset state for new file
    if (file) {
      console.log(`File accepted: ${file.name}, type: ${file.type}`);
      setExtractedData(null);
      setSelectedPage(1);
      
      // If it's a PDF, try to get the page count
      if (file.type === 'application/pdf') {
        getPdfPageCount(file)
          .then(count => {
            console.log(`PDF has ${count} pages`);
            setPdfPageCount(count);
          })
          .catch(err => {
            console.error('Error getting page count:', err);
            setPdfPageCount(0);
          });
      } else {
        // Not a PDF, reset page count
        setPdfPageCount(0);
      }
    } else {
      // No file, reset page count
      setPdfPageCount(0);
    }
  };

  const extractW2Data = async (apiKey: string): Promise<void> => {
    if (!file || !apiKey) {
      setError({
        title: 'Missing Information',
        message: 'Please provide both a W2 file and an OpenAI API key.'
      });
      return;
    }

    // For PDFs, use the specific page extraction method
    if (file.type === 'application/pdf') {
      return extractW2DataFromPage(apiKey, selectedPage); 
    }

    // For multiple files (but not PDFs), use the multi-file extraction
    if (multipleFiles.length > 1 && !file.type.includes('pdf')) {
      return extractFromMultipleFiles(apiKey);
    }

    setIsExtracting(true);
    setError(null);

    try {
      // Handle different file types appropriately
      let base64Image = '';
      let mimeTypeForOpenAI = file.type;
      
      try {
        // For non-PDF files (images), we can read them directly
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            try {
              const result = reader.result as string;
              // Extract the base64 part if it's a data URL
              const base64 = result.split(',')[1] || result;
              resolve(base64);
            } catch (e) {
              reject(e);
            }
          };
          reader.onerror = reject;
        });
        
        reader.readAsDataURL(file);
        base64Image = await base64Promise;
        console.log(`Successfully read ${file.type} file as base64`);
      } catch (fileErr) {
        console.error('Error reading file:', fileErr);
        throw new Error('Could not read the uploaded file. Please try a different file.');
      }
      
      // Extract data using OpenAI with the appropriate MIME type
      const data = await extractW2DataWithOpenAI(apiKey, base64Image, mimeTypeForOpenAI);
      
      // Save data to storage
      await saveW2Data(data);
      
      // Update state
      setExtractedData(data);
      
      // Check if we have sample data (indicating a PDF format issue)
      const isSampleData = data.employerName.includes('SAMPLE DATA');
      
      if (isSampleData) {
        toast({
          title: "PDF Format Limitation",
          description: "We've received placeholder data because PDF files can't be processed directly. Try uploading a PNG or JPEG image instead.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "W2 Data Extracted",
          description: "Your W2 information has been extracted successfully.",
        });
      }
    } catch (err) {
      console.error('Extraction error:', err);
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          setError({
            title: 'API Key Error',
            message: 'Your OpenAI API key appears to be invalid. Please check and try again.'
          });
        } else if (err.message.includes('PDF') || err.message.includes('convert')) {
          setError({
            title: 'PDF Conversion Error',
            message: 'There was a problem converting your PDF to an image format that OpenAI can process. Please try using a PNG or JPEG image of your W2 form instead.'
          });
        } else if (err.message.includes('file')) {
          setError({
            title: 'File Processing Error',
            message: 'There was a problem processing your file. Please try uploading the file again or try a different format.'
          });
        } else {
          setError({
            title: 'Extraction Error',
            message: `An error occurred during extraction: ${err.message}`
          });
        }
      } else {
        setError({
          title: 'Unexpected Error',
          message: 'An unknown error occurred. Please try again later.'
        });
      }
    } finally {
      setIsExtracting(false);
    }
  };
  
  // Function to extract data from multiple image files - using a single API call
  const extractFromMultipleFiles = async (apiKey: string): Promise<void> => {
    if (multipleFiles.length === 0 || !apiKey) {
      setError({
        title: 'Missing Information',
        message: 'Please provide both W2 files and an OpenAI API key.'
      });
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      toast({
        title: "Preparing Files",
        description: `Processing ${multipleFiles.length} files for a consolidated extraction...`,
      });
      
      // Collect all images data to make a single API call
      const imageDataArray: ImageData[] = [];
      
      // Process all files to extract base64 data for each
      for (const file of multipleFiles) {
        // Skip PDF files in multi-file mode
        if (file.type === 'application/pdf') {
          toast({
            title: "Skipping PDF File",
            description: `Skipping ${file.name} - PDF files require individual processing.`,
            variant: "destructive"
          });
          continue;
        }
        
        try {
          // Read the file
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              try {
                const result = reader.result as string;
                const base64 = result.split(',')[1] || result;
                resolve(base64);
              } catch (e) {
                reject(e);
              }
            };
            reader.onerror = reject;
          });
          
          reader.readAsDataURL(file);
          const base64Data = await base64Promise;
          
          // Add the image data to our array
          imageDataArray.push({
            base64: base64Data,
            mimeType: file.type,
            fileName: file.name
          });
          
          console.log(`Successfully processed ${file.name} for multi-image extraction`);
        } catch (fileErr) {
          console.error(`Error processing file ${file.name}:`, fileErr);
          toast({
            title: "File Processing Error",
            description: `Could not process ${file.name}. Continuing with other files.`,
            variant: "destructive"
          });
        }
      }
      
      if (imageDataArray.length === 0) {
        throw new Error('No valid images could be processed for extraction');
      }
      
      toast({
        title: "Starting Extraction",
        description: `Making a single API call with all ${imageDataArray.length} images...`,
      });
      
      // Make a single API call with all images
      const data = await extractW2DataFromMultipleImages(apiKey, imageDataArray);
      
      // Save and update state
      setExtractedData(data);
      await saveW2Data(data);
      
      toast({
        title: "Multi-Image Extraction Complete",
        description: `Successfully processed ${imageDataArray.length} images and extracted a complete set of W2 data.`,
      });
      
    } catch (err) {
      console.error('Error in multi-file extraction:', err);
      
      if (err instanceof Error) {
        setError({
          title: 'Multi-File Extraction Error',
          message: `An error occurred during multi-file extraction: ${err.message}`
        });
      } else {
        setError({
          title: 'Unexpected Error',
          message: 'An unknown error occurred during multi-file processing. Please try again with fewer files.'
        });
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const clearData = () => {
    setExtractedData(null);
    setFile(null);
    setMultipleFiles([]);
    setError(null);
  };

  // Method to set which page to use (for multi-page PDFs)
  const setPage = (page: number) => {
    if (page >= 1 && page <= pdfPageCount) {
      setSelectedPage(page);
    }
  };

  // Method to extract from a specific page
  const extractW2DataFromPage = async (apiKey: string, pageNumber: number): Promise<void> => {
    if (!file || !apiKey) {
      setError({
        title: 'Missing Information',
        message: 'Please provide both a W2 file and an OpenAI API key.'
      });
      return;
    }

    if (file.type !== 'application/pdf') {
      // For non-PDF files, just use the standard extraction
      return extractW2Data(apiKey);
    }

    setIsExtracting(true);
    setError(null);

    try {
      // For PDFs, we directly send the base64 PDF data (simplified approach)
      console.log(`Processing PDF data for extraction`);
      const base64Image = await convertPdfToImage(file);
      
      // Extract data using OpenAI - we need to use an image format that OpenAI supports
      // Even though we're passing PDF data, we'll tell OpenAI it's a PNG 
      const data = await extractW2DataWithOpenAI(apiKey, base64Image, 'image/png');
      
      // Save and update state
      await saveW2Data(data);
      setExtractedData(data);
      
      // Check if we have sample data (indicating a PDF format issue)
      const isSampleData = data.employerName.includes('SAMPLE DATA');
      
      if (isSampleData) {
        toast({
          title: "PDF Format Limitation",
          description: "We've received placeholder data because PDF files can't be processed directly. Try uploading a PNG or JPEG image instead.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "W2 Data Extracted",
          description: `Successfully extracted W2 data from page ${pageNumber}.`
        });
      }
    } catch (err) {
      console.error(`Error extracting from page ${pageNumber}:`, err);
      
      if (err instanceof Error) {
        setError({
          title: 'Extraction Error',
          message: `Failed to extract from page ${pageNumber}: ${err.message}`
        });
      } else {
        setError({
          title: 'Unexpected Error',
          message: 'An unknown error occurred. Please try again later.'
        });
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle multiple files
  const handleMultipleFilesChange = (files: File[]) => {
    if (files.length > 0) {
      setMultipleFiles(files);
      // Also set the first file as the current file using existing handler
      handleFileChange(files[0]);
    } else {
      setMultipleFiles([]);
      handleFileChange(null);
    }
  };

  return {
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
    clearError: () => setError(null)
  };
}
