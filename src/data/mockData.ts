import { CertificateData, CertificateTemplate } from '@/types/certificate';

export const mockTemplates: CertificateTemplate[] = [
  {
    id: 'classic',
    name: 'Classic Blue',
    backgroundColor: '#f8fafc',
    borderColor: '#2563eb',
    titleColor: '#1e40af',
    textColor: '#374151',
    accentColor: '#3b82f6',
    backgroundPattern: 'geometric',
    layout: 'classic'
  },
  {
    id: 'elegant',
    name: 'Elegant Gold',
    backgroundColor: '#fefbf7',
    borderColor: '#d97706',
    titleColor: '#92400e',
    textColor: '#374151',
    accentColor: '#f59e0b',
    backgroundPattern: 'ornate',
    layout: 'elegant'
  },
  {
    id: 'modern',
    name: 'Modern Green',
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
    titleColor: '#15803d',
    textColor: '#374151',
    accentColor: '#22c55e',
    backgroundPattern: 'minimal',
    layout: 'modern'
  },
  {
    id: 'professional',
    name: 'Professional Purple',
    backgroundColor: '#faf7ff',
    borderColor: '#7c3aed',
    titleColor: '#6d28d9',
    textColor: '#374151',
    accentColor: '#8b5cf6',
    backgroundPattern: 'corporate',
    layout: 'professional'
  }
];

export const mockCertificateData: CertificateData = {
  id: 'cert-2024-001',
  certificateTitle: 'Certificate of Completion',
  statement: 'This is to certify that the above named individual has successfully completed all requirements and demonstrated proficiency in',
  student: {
    id: 'student-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    enrollmentDate: '2024-01-15'
  },
  course: {
    id: 'course-456',
    title: 'Advanced React Development',
    instructors: [{
      id: 'instructor-1',
      name: 'Dr. Sarah Johnson',
      title: 'Senior Software Engineer',
      email: 'sarah.johnson@techcorp.com'
    }],
    duration: '12 weeks',
    completionDate: '2024-08-05',
    category: 'Web Development',
    level: 'Advanced',
    credentialId: 'ADV-REACT-2024-001',
    totalHours: 120,
    grade: 'A',
    skillsLearned: ['React Hooks', 'Redux', 'TypeScript', 'Testing']
  },
  institution: {
    id: 'inst-001',
    name: 'TechLearn Academy',
    website: 'https://techlearn.academy',
    accreditation: 'Accredited by International Tech Education Board'
  },
  credential: {
    specialization: 'Full Stack Development',
    track: 'React Specialist',
    accreditingBody: 'React Foundation'
  },
  template: mockTemplates[0],
  issueDate: '2024-08-06',
  verificationUrl: 'https://platform.example.com/verify/cert-2024-001',
  signature: {
    name: 'Michael Smith',
    title: 'Chief Academic Officer',
    date: '2024-08-06'
  },
  language: 'en'
};

export const mockCourseOptions = [
  {
    id: 'react-advanced',
    title: 'Advanced React Development',
    instructors: [{
      id: 'instructor-1',
      name: 'Dr. Sarah Johnson',
      title: 'Senior React Developer'
    }],
    category: 'Web Development',
    level: 'Advanced' as const,
    totalHours: 120,
    skillsLearned: ['React Hooks', 'Redux', 'TypeScript', 'Testing']
  },
  {
    id: 'nodejs-backend',
    title: 'Node.js Backend Development',
    instructors: [{
      id: 'instructor-2',
      name: 'Prof. David Wilson',
      title: 'Backend Architecture Specialist'
    }],
    category: 'Backend Development',
    level: 'Intermediate' as const,
    totalHours: 80,
    skillsLearned: ['Express.js', 'MongoDB', 'REST APIs', 'Authentication']
  },
  {
    id: 'python-basics',
    title: 'Python Programming Fundamentals',
    instructors: [{
      id: 'instructor-3',
      name: 'Dr. Emily Chen',
      title: 'Python Expert'
    }],
    category: 'Programming',
    level: 'Beginner' as const,
    totalHours: 60,
    skillsLearned: ['Python Syntax', 'Data Structures', 'OOP', 'File Handling']
  },
  {
    id: 'data-science',
    title: 'Data Science with Machine Learning',
    instructors: [{
      id: 'instructor-4',
      name: 'Dr. Alex Kumar',
      title: 'Data Science Lead'
    }],
    category: 'Data Science',
    level: 'Advanced' as const,
    totalHours: 150,
    skillsLearned: ['Machine Learning', 'Python', 'Statistics', 'Data Visualization']
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design Principles',
    instructors: [{
      id: 'instructor-5',
      name: 'Jessica Martinez',
      title: 'Senior UX Designer'
    }],
    category: 'Design',
    level: 'Intermediate' as const,
    totalHours: 90,
    skillsLearned: ['Design Thinking', 'Prototyping', 'User Research', 'Figma']
  }
];

// Security utilities
export const generateSecureId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`.toUpperCase();
};

export const generateVerificationUrl = (certificateId: string): string => {
  return `https://platform.example.com/verify/${certificateId}`;
};

// Mock validation function
export const validateCertificateData = (data: Partial<CertificateData>): string[] => {
  const errors: string[] = [];
  
  if (!data.student?.name?.trim()) {
    errors.push('Student name is required');
  }
  
  if (!data.course?.title?.trim()) {
    errors.push('Course title is required');
  }
  
  if (!data.course?.instructors?.length || !data.course.instructors[0]?.name?.trim()) {
    errors.push('At least one instructor is required');
  }
  
  if (!data.signature?.name?.trim()) {
    errors.push('Signature name is required');
  }
  
  if (!data.certificateTitle?.trim()) {
    errors.push('Certificate title is required');
  }
  
  if (!data.institution?.name?.trim()) {
    errors.push('Institution name is required');
  }
  
  return errors;
};
