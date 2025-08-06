import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { CertificateData } from "@/types/certificate";
import { createFallbackCertificatePDF } from "./fallbackPdf";
import { createPrintOptimizedCertificate } from "./printOptimizedCertificate";

export interface PDFOptions {
  format: "A4" | "Letter" | "A3";
  orientation: "portrait" | "landscape";
  quality: number;
  includeWatermark: boolean;
  includeMetadata: boolean;
}

export const defaultPDFOptions: PDFOptions = {
  format: "A4",
  orientation: "landscape",
  quality: 1.0,
  includeWatermark: true,
  includeMetadata: true,
};

// Generate PDF from HTML element
export const generatePDFFromElement = async (
  element: HTMLElement,
  certificateData: CertificateData,
  options: Partial<PDFOptions> = {}
): Promise<Blob> => {
  const finalOptions = { ...defaultPDFOptions, ...options };

  try {
    console.log("Starting PDF generation...");

    // Create a print-optimized version of the certificate
    const printElement = createPrintOptimizedCertificate(certificateData);

    // Temporarily add to DOM for rendering
    printElement.style.position = "absolute";
    printElement.style.left = "-9999px";
    printElement.style.top = "-9999px";
    document.body.appendChild(printElement);

    // Wait a moment for styles to apply
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create canvas from the print-optimized element
    const canvas = await html2canvas(printElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: certificateData.template.backgroundColor,
      logging: false,
      width: 1024,
      height: 768,
    });

    // Remove the temporary element
    document.body.removeChild(printElement);

    console.log("Canvas created successfully:", canvas);

    // Create PDF with A4 landscape dimensions
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Calculate dimensions to fit A4 landscape (297x210mm)
    const pdfWidth = 297;
    const pdfHeight = 210;

    // Add certificate image to fit the page
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    console.log("Image data created, length:", imgData.length);

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    // Add simple metadata if enabled
    if (finalOptions.includeMetadata) {
      pdf.setProperties({
        title: `Certificate - ${certificateData.student.name || "Unknown"}`,
        subject: certificateData.course.title || "Course Certificate",
        author: certificateData.institution.name || "Institution",
        creator: "Certificate Generator",
      });
    }

    const blob = pdf.output("blob");
    console.log("PDF generated successfully, blob size:", blob.size);
    return blob;
  } catch (error) {
    console.error("Detailed PDF generation error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Try fallback PDF generation
    console.log("Attempting fallback PDF generation...");
    try {
      return createFallbackCertificatePDF(certificateData);
    } catch (fallbackError) {
      console.error("Fallback PDF generation also failed:", fallbackError);
      throw new Error(
        `Failed to generate PDF certificate: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
};

// Generate filename for PDF
export const generateFileName = (certificateData: CertificateData): string => {
  const sanitizedName = certificateData.student.name
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");

  const sanitizedCourse = certificateData.course.title
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");

  const date = new Date(certificateData.issueDate).toISOString().split("T")[0];

  return `Certificate_${sanitizedName}_${sanitizedCourse}_${date}.pdf`;
};

// Download blob as file
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Preview PDF in new tab
export const previewPDF = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const newTab = window.open(url, "_blank");

  if (!newTab) {
    // Fallback if popup is blocked
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.click();
  }

  // Note: URL will be automatically revoked when tab is closed
};
