import { CertificateData } from "@/types/certificate";

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  // Only remove dangerous HTML/script characters, preserve spaces and normal text
  return input
    .replace(/[<>]/g, (match) => {
      const escapeMap: { [key: string]: string } = {
        "<": "&lt;",
        ">": "&gt;",
      };
      return escapeMap[match];
    })
    .substring(0, 500); // Reasonable length limit
};

// Generate secure verification hash
export const generateVerificationHash = (data: CertificateData): string => {
  const hashInput = [
    data.id,
    data.student.name,
    data.student.email,
    data.course.title,
    data.course.credentialId,
    data.issueDate,
  ].join("|");

  // Simple hash function for demo (in production use crypto.subtle or similar)
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36).padStart(8, "0").toUpperCase();
};

// Generate QR code data
export const generateQRCodeData = (
  certificateData: CertificateData
): string => {
  const qrData = {
    id: certificateData.id,
    name: certificateData.student.name,
    course: certificateData.course.title,
    issued: certificateData.issueDate,
    verify: certificateData.verificationUrl,
    hash: generateVerificationHash(certificateData),
  };

  return JSON.stringify(qrData);
};

// Validate certificate data integrity
export const validateCertificateIntegrity = (
  data: CertificateData
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check required fields
  if (!data.id?.trim()) errors.push("Certificate ID is missing");
  if (!data.certificateTitle?.trim())
    errors.push("Certificate title is missing");
  if (!data.student?.name?.trim()) errors.push("Student name is missing");
  if (!data.course?.title?.trim()) errors.push("Course title is missing");
  if (!data.course?.credentialId?.trim())
    errors.push("Credential ID is missing");
  if (
    !data.course?.instructors?.length ||
    !data.course.instructors[0]?.name?.trim()
  ) {
    errors.push("At least one instructor is required");
  }
  if (!data.institution?.name?.trim())
    errors.push("Institution name is missing");
  if (!data.signature?.name?.trim()) errors.push("Signature name is missing");
  if (!data.issueDate) errors.push("Issue date is missing");

  // Validate email format (only if provided)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    data.student?.email &&
    data.student.email.trim() &&
    !emailRegex.test(data.student.email)
  ) {
    errors.push("Invalid email format");
  }

  // Validate dates
  const issueDate = new Date(data.issueDate);
  const currentDate = new Date();
  if (isNaN(issueDate.getTime())) {
    errors.push("Invalid issue date");
  } else if (issueDate > currentDate) {
    errors.push("Issue date cannot be in the future");
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
  ];

  const allTextContent = [
    data.student?.name,
    data.student?.email,
    data.course?.title,
    data.course?.instructors?.[0]?.name,
    data.signature?.name,
    data.signature?.title,
    data.institution?.name,
    data.certificateTitle,
  ]
    .filter(Boolean)
    .join(" ");

  suspiciousPatterns.forEach((pattern) => {
    if (pattern.test(allTextContent)) {
      errors.push("Potentially malicious content detected");
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting simulation (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const key = identifier;

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = requestCounts.get(key)!;

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

// Watermark generation
export const generateWatermark = (): string => {
  const timestamp = new Date().toISOString();
  const randomId = Math.random().toString(36).substring(2, 10);
  return `CERT-${randomId}-${timestamp.substring(0, 10)}`;
};

// CSP (Content Security Policy) headers for security
export const getSecurityHeaders = () => ({
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Required for fabric.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
});
