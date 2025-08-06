import jsPDF from "jspdf";
import { CertificateData } from "@/types/certificate";

// Simple fallback for PDF generation if html2canvas fails
export const createFallbackCertificatePDF = (
  certificateData: CertificateData
): Blob => {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Add simple text-based certificate as fallback
  pdf.setFontSize(20);
  pdf.text("CERTIFICATE OF COMPLETION", 148, 40, { align: "center" });

  pdf.setFontSize(16);
  pdf.text("This certifies that", 148, 60, { align: "center" });

  pdf.setFontSize(18);
  pdf.text(certificateData.student.name || "Student Name", 148, 80, {
    align: "center",
  });

  pdf.setFontSize(14);
  pdf.text("has completed the course", 148, 100, { align: "center" });

  pdf.setFontSize(16);
  pdf.text(certificateData.course.title || "Course Title", 148, 120, {
    align: "center",
  });

  pdf.setFontSize(12);
  pdf.text(
    `Issued by: ${certificateData.institution.name || "Institution"}`,
    148,
    140,
    { align: "center" }
  );
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 148, 155, {
    align: "center",
  });
  pdf.text(`Certificate ID: ${certificateData.id}`, 148, 170, {
    align: "center",
  });

  return pdf.output("blob");
};
