export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
}

export interface InstructorInfo {
  id: string;
  name: string;
  title?: string;
  email?: string;
  signatureImageUrl?: string;
}

export interface CourseInfo {
  id: string;
  title: string;
  instructors: InstructorInfo[];
  duration: string;
  completionDate: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  credentialId: string;
  totalHours?: number;
  grade?: string;
  skillsLearned?: string[];
  description?: string;
}

export interface InstitutionInfo {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  address?: string;
  accreditation?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  titleColor: string;
  textColor: string;
  accentColor?: string;
  logoUrl?: string;
  backgroundPattern?: string;
  layout: 'classic' | 'modern' | 'elegant' | 'professional';
}

export interface CredentialInfo {
  badgeUrl?: string;
  specialization?: string;
  track?: string;
  partnerLogos?: string[];
  accreditingBody?: string;
}

export interface CertificateData {
  id: string;
  // Certificate Details
  certificateTitle: string;
  statement: string;
  
  // Recipient Information
  student: StudentInfo;
  
  // Course Information
  course: CourseInfo;
  
  // Institution Information
  institution: InstitutionInfo;
  
  // Credential Information
  credential?: CredentialInfo;
  
  // Design and Layout
  template: CertificateTemplate;
  
  // Dates and Validation
  issueDate: string;
  expiryDate?: string;
  verificationUrl: string;
  
  // Signature Information
  signature: {
    name: string;
    title: string;
    imageUrl?: string;
    date?: string;
  };
  
  // Additional Features
  qrCodeData?: string;
  watermark?: string;
  language?: 'en' | 'es' | 'fr' | 'de' | 'pt';
}

export interface SecurityFeatures {
  watermark: boolean;
  qrCode: boolean;
  hologram: boolean;
  serialNumber: boolean;
}
