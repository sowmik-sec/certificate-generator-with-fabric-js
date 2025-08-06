import { CertificateData } from "@/types/certificate";

export const createPrintOptimizedCertificate = (
  certificateData: CertificateData
): HTMLElement => {
  const certificateDiv = document.createElement("div");

  // Set up the main certificate container with inline styles
  certificateDiv.style.cssText = `
    width: 1024px;
    height: 768px;
    background-color: ${certificateData.template.backgroundColor};
    position: relative;
    font-family: Arial, sans-serif;
    border: 3px solid ${certificateData.template.borderColor};
    border-radius: 8px;
    box-sizing: border-box;
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `;

  // Header section
  const header = document.createElement("div");
  header.style.cssText = "text-align: center;";

  // Institution logo
  if (certificateData.institution.logoUrl) {
    const logo = document.createElement("img");
    logo.src = certificateData.institution.logoUrl;
    logo.style.cssText =
      "height: 48px; width: auto; margin: 0 auto 12px auto; display: block;";
    header.appendChild(logo);
  }

  // Institution name
  const institutionName = document.createElement("h2");
  institutionName.textContent = certificateData.institution.name;
  institutionName.style.cssText = `
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: ${certificateData.template.textColor};
  `;
  header.appendChild(institutionName);

  // Certificate title
  const title = document.createElement("h1");
  title.textContent = certificateData.certificateTitle.toUpperCase();
  title.style.cssText = `
    font-size: 36px;
    font-weight: bold;
    margin: 0 0 12px 0;
    color: ${certificateData.template.titleColor};
    font-family: Georgia, serif;
    letter-spacing: 1px;
  `;
  header.appendChild(title);

  // Title underline
  const titleLine = document.createElement("div");
  titleLine.style.cssText = `
    width: 256px;
    height: 4px;
    background-color: ${certificateData.template.titleColor};
    margin: 0 auto 24px auto;
  `;
  header.appendChild(titleLine);

  certificateDiv.appendChild(header);

  // Main content section
  const mainContent = document.createElement("div");
  mainContent.style.cssText = `
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 16px;
  `;

  // "This is to certify that" text
  const certifyText = document.createElement("p");
  certifyText.textContent = "This is to certify that";
  certifyText.style.cssText = `
    font-size: 18px;
    margin: 0;
    color: ${certificateData.template.textColor};
  `;
  mainContent.appendChild(certifyText);

  // Student name
  const studentName = document.createElement("h2");
  studentName.textContent = certificateData.student.name.toUpperCase();
  studentName.style.cssText = `
    font-size: 28px;
    font-weight: bold;
    margin: 16px 0;
    color: ${certificateData.template.titleColor};
    font-family: Georgia, serif;
    letter-spacing: 1px;
  `;
  mainContent.appendChild(studentName);

  // Name underline
  const nameLine = document.createElement("div");
  nameLine.style.cssText = `
    width: 320px;
    height: 1px;
    background-color: ${certificateData.template.textColor};
    margin: 0 auto 16px auto;
  `;
  mainContent.appendChild(nameLine);

  // "has successfully completed" text
  const completedText = document.createElement("p");
  completedText.textContent = "has successfully completed the course";
  completedText.style.cssText = `
    font-size: 18px;
    margin: 0;
    color: ${certificateData.template.textColor};
  `;
  mainContent.appendChild(completedText);

  // Course title
  const courseTitle = document.createElement("h3");
  courseTitle.textContent = certificateData.course.title;
  courseTitle.style.cssText = `
    font-size: 24px;
    font-weight: bold;
    margin: 16px 0 8px 0;
    color: ${certificateData.template.titleColor};
    font-family: Georgia, serif;
  `;
  mainContent.appendChild(courseTitle);

  // Instructor info
  if (
    certificateData.course.instructors &&
    certificateData.course.instructors[0]?.name
  ) {
    const instructorText = document.createElement("p");
    instructorText.textContent = `Instructed by: ${certificateData.course.instructors[0].name}`;
    instructorText.style.cssText = `
      font-size: 16px;
      margin: 0 0 12px 0;
      color: ${certificateData.template.textColor};
    `;
    mainContent.appendChild(instructorText);
  }

  // Course details
  const courseDetails = document.createElement("div");
  courseDetails.style.cssText = `
    font-size: 14px;
    color: ${certificateData.template.textColor};
    margin-top: 12px;
  `;

  const details = [];
  if (certificateData.course.duration)
    details.push(`Duration: ${certificateData.course.duration}`);
  details.push(`Level: ${certificateData.course.level}`);
  if (certificateData.course.grade)
    details.push(`Grade: ${certificateData.course.grade}`);

  courseDetails.textContent = details.join(" | ");
  mainContent.appendChild(courseDetails);

  certificateDiv.appendChild(mainContent);

  // Bottom section
  const bottom = document.createElement("div");
  bottom.style.cssText =
    "display: flex; justify-content: space-between; align-items: end;";

  // Date section
  const dateSection = document.createElement("div");
  dateSection.style.cssText = "text-align: left;";

  const dateLabel = document.createElement("p");
  dateLabel.textContent = "Date of Completion:";
  dateLabel.style.cssText = `
    font-size: 14px;
    margin: 0 0 4px 0;
    color: ${certificateData.template.textColor};
  `;
  dateSection.appendChild(dateLabel);

  const dateValue = document.createElement("p");
  dateValue.textContent = new Date(
    certificateData.course.completionDate
  ).toLocaleDateString();
  dateValue.style.cssText = `
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 4px 0;
    color: ${certificateData.template.titleColor};
  `;
  dateSection.appendChild(dateValue);

  const dateLine = document.createElement("div");
  dateLine.style.cssText = `
    width: 96px;
    height: 1px;
    background-color: ${certificateData.template.textColor};
  `;
  dateSection.appendChild(dateLine);

  bottom.appendChild(dateSection);

  // Center badge
  const badge = document.createElement("div");
  badge.style.cssText = `
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid ${certificateData.template.titleColor};
    background-color: ${certificateData.template.titleColor}15;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: ${certificateData.template.titleColor};
  `;
  badge.textContent = "CERTIFIED";
  bottom.appendChild(badge);

  // Signature section
  const signatureSection = document.createElement("div");
  signatureSection.style.cssText = "text-align: right;";

  const signatureLabel = document.createElement("p");
  signatureLabel.textContent = "Authorized Signature:";
  signatureLabel.style.cssText = `
    font-size: 14px;
    margin: 0 0 4px 0;
    color: ${certificateData.template.textColor};
  `;
  signatureSection.appendChild(signatureLabel);

  const signatureName = document.createElement("p");
  signatureName.textContent = certificateData.signature.name;
  signatureName.style.cssText = `
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 4px 0;
    color: ${certificateData.template.titleColor};
  `;
  signatureSection.appendChild(signatureName);

  if (certificateData.signature.title) {
    const signatureTitle = document.createElement("p");
    signatureTitle.textContent = certificateData.signature.title;
    signatureTitle.style.cssText = `
      font-size: 14px;
      margin: 0 0 4px 0;
      color: ${certificateData.template.textColor};
    `;
    signatureSection.appendChild(signatureTitle);
  }

  const signatureLine = document.createElement("div");
  signatureLine.style.cssText = `
    width: 96px;
    height: 1px;
    background-color: ${certificateData.template.textColor};
    margin-left: auto;
  `;
  signatureSection.appendChild(signatureLine);

  bottom.appendChild(signatureSection);

  certificateDiv.appendChild(bottom);

  // Footer
  const footer = document.createElement("div");
  footer.style.cssText = "text-align: center; margin-top: 24px;";

  const issueDate = document.createElement("p");
  const issueDateText = `Issued on ${new Date(
    certificateData.issueDate
  ).toLocaleDateString()}`;
  const websiteText = certificateData.institution.website
    ? ` | ${certificateData.institution.website}`
    : "";
  issueDate.textContent = issueDateText + websiteText;
  issueDate.style.cssText = `
    font-size: 12px;
    margin: 0 0 12px 0;
    color: ${certificateData.template.textColor};
    opacity: 0.8;
  `;
  footer.appendChild(issueDate);

  const certId = document.createElement("p");
  certId.textContent = `Certificate ID: ${certificateData.id}`;
  certId.style.cssText = `
    font-size: 10px;
    margin: 0;
    color: ${certificateData.template.textColor};
    opacity: 0.6;
    font-family: monospace;
  `;
  footer.appendChild(certId);

  certificateDiv.appendChild(footer);

  return certificateDiv;
};
