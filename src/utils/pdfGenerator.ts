import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CertificateData } from '@/types/certificate';
import { generateWatermark, generateVerificationHash } from './security';

export interface PDFOptions {
  format: 'A4' | 'Letter' | 'A3';
  orientation: 'portrait' | 'landscape';
  quality: number;
  includeWatermark: boolean;
  includeMetadata: boolean;
}

export const defaultPDFOptions: PDFOptions = {
  format: 'A4',
  orientation: 'landscape',
  quality: 1.0,
  includeWatermark: true,
  includeMetadata: true
};

// Generate PDF from HTML element
export const generatePDFFromElement = async (
  element: HTMLElement,
  certificateData: CertificateData,
  options: Partial<PDFOptions> = {}
): Promise<Blob> => {
  const finalOptions = { ...defaultPDFOptions, ...options };
  
  try {
    // Create canvas from element
    const canvas = await html2canvas(element, {
      scale: finalOptions.quality,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      onclone: (clonedDoc) => {
        // Ensure fonts are loaded in cloned document
        const clonedElement = clonedDoc.getElementById(element.id);
        if (clonedElement) {
          clonedElement.style.fontFamily = 'Arial, sans-serif';
        }
      }
    });

    // Calculate PDF dimensions
    const imgWidth = finalOptions.format === 'A4' 
      ? (finalOptions.orientation === 'landscape' ? 297 : 210)
      : finalOptions.format === 'Letter'
      ? (finalOptions.orientation === 'landscape' ? 279 : 216)
      : (finalOptions.orientation === 'landscape' ? 420 : 297);
    
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: finalOptions.orientation,
      unit: 'mm',
      format: finalOptions.format.toLowerCase() as 'a4' | 'letter' | 'a3',
      compress: true
    });

    // Add certificate image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Add watermark if enabled
    if (finalOptions.includeWatermark) {
      addWatermark(pdf, imgWidth, imgHeight);
    }

    // Add metadata if enabled
    if (finalOptions.includeMetadata) {
      addMetadata(pdf, certificateData);
    }

    // Add security features
    addSecurityFeatures(pdf, certificateData);

    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF certificate');
  }
};

// Add watermark to PDF
const addWatermark = (pdf: jsPDF, width: number, height: number): void => {
  const watermarkText = generateWatermark();
  
  // Set watermark properties
  pdf.setTextColor(200, 200, 200);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  // Add diagonal watermarks
  const step = 50;
  for (let x = -width; x < width * 2; x += step) {
    for (let y = -height; y < height * 2; y += step) {
      pdf.text(watermarkText, x, y, { angle: 45 });
    }
  }
};

// Add metadata to PDF
const addMetadata = (pdf: jsPDF, certificateData: CertificateData): void => {
  const metadata = {
    title: `Certificate - ${certificateData.course.title}`,
    author: 'Online Learning Platform',
    subject: `Certificate of Completion for ${certificateData.student.name}`,
    creator: 'Certificate Generator',
    keywords: [
      'certificate',
      'completion',
      certificateData.course.category,
      certificateData.course.level
    ].join(', ')
  };

  // Set PDF metadata
  pdf.setProperties(metadata);
  
  // Add creation timestamp
  const timestamp = new Date().toISOString();
  pdf.setCreationDate(new Date(timestamp));
};

// Add security features to PDF
const addSecurityFeatures = (pdf: jsPDF, certificateData: CertificateData): void => {
  const verificationHash = generateVerificationHash(certificateData);
  
  // Add invisible verification text (can be detected by PDF readers)
  pdf.setTextColor(255, 255, 255); // White text (invisible on white background)
  pdf.setFontSize(1);
  pdf.text(`VERIFY:${verificationHash}:${certificateData.id}`, 1, 1);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
};

// Generate filename for download
export const generateFileName = (certificateData: CertificateData): string => {
  const sanitizedName = certificateData.student.name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  const sanitizedCourse = certificateData.course.title
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  const date = new Date(certificateData.issueDate)
    .toISOString()
    .split('T')[0];
  
  return `Certificate_${sanitizedName}_${sanitizedCourse}_${date}.pdf`;
};

// Validate PDF generation requirements
export const validatePDFRequirements = (): { isSupported: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for required APIs
  if (!window.HTMLCanvasElement) {
    errors.push('Canvas API not supported');
  }
  
  if (!window.Blob) {
    errors.push('Blob API not supported');
  }
  
  // Check for HTML2Canvas requirements
  if (!document.createElement('canvas').getContext) {
    errors.push('Canvas 2D context not supported');
  }
  
  return {
    isSupported: errors.length === 0,
    errors
  };
};

// Download blob as file
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Preview PDF in new tab
export const previewPDF = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const newTab = window.open(url, '_blank');
  
  if (!newTab) {
    // Fallback if popup is blocked
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.click();
  }
  
  // Note: URL will be automatically revoked when tab is closed
};
