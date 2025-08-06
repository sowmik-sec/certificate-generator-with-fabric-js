import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Simple test function to verify PDF generation works
export const testPdfGeneration = async (): Promise<boolean> => {
  try {
    // Create a simple test element
    const testDiv = document.createElement("div");
    testDiv.innerHTML = '<h1 style="color: blue;">Test Certificate</h1>';
    testDiv.style.width = "800px";
    testDiv.style.height = "600px";
    testDiv.style.backgroundColor = "white";
    testDiv.style.padding = "20px";

    // Temporarily add to body
    document.body.appendChild(testDiv);

    // Generate canvas
    const canvas = await html2canvas(testDiv, {
      scale: 1,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "white",
    });

    // Remove test element
    document.body.removeChild(testDiv);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 10, 277, 190);

    // Test if we can create blob
    const blob = pdf.output("blob");
    return blob.size > 0;
  } catch (error) {
    console.error("PDF test failed:", error);
    return false;
  }
};
