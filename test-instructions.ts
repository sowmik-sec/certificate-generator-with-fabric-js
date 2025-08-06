// Simple test steps for the certificate generator

// 1. Fill in Student Information:
// - Certificate Title: "Certificate of Completion"
// - Student Name: "John Doe Smith" (test with spaces)
// - Institution Name: "Tech Academy Online"
// - Institution Logo: "/default-logo.svg"

// 2. Fill in Course Information:
// - Course Title: "Advanced React Development Course"
// - Instructor Name: "Dr. Sarah Johnson"
// - Authorized Signature: "Michael Davis"
// - Signature Title: "Director of Education"
// - Course Duration: "12 weeks"
// - Course Level: "Advanced"
// - Grade: "A+"

// 3. Test the buttons:
// - Preview PDF should open in new tab
// - Download PDF should download the certificate

// 4. Expected behavior:
// - All input fields should accept spaces and special characters
// - Certificate preview should display correctly
// - PDF generation should work without errors
// - Default logo should appear if logo URL is set

export const testData = {
  certificateTitle: "Certificate of Completion",
  studentName: "John Doe Smith",
  institutionName: "Tech Academy Online",
  logoUrl: "/default-logo.svg",
  courseTitle: "Advanced React Development Course",
  instructorName: "Dr. Sarah Johnson",
  signatureName: "Michael Davis",
  signatureTitle: "Director of Education",
  duration: "12 weeks",
  level: "Advanced",
  grade: "A+",
};
