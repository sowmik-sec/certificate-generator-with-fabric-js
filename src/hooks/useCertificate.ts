'use client';

import { useState, useCallback, useEffect } from 'react';
import { CertificateData } from '@/types/certificate';
import { 
  validateCertificateIntegrity, 
  sanitizeInput,
  checkRateLimit 
} from '@/utils/security';
import { 
  generateSecureId, 
  generateVerificationUrl,
  mockTemplates 
} from '@/data/mockData';

export interface UseCertificateOptions {
  autoSave?: boolean;
  storageKey?: string;
}

export const useCertificate = (options: UseCertificateOptions = {}) => {
  const { autoSave = false, storageKey = 'certificate-data' } = options;

  const [certificateData, setCertificateData] = useState<CertificateData>(() => {
    // Try to load from localStorage if autoSave is enabled
    if (autoSave && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedData = JSON.parse(saved);
          // Validate the loaded data
          const validation = validateCertificateIntegrity(parsedData);
          if (validation.isValid) {
            return parsedData;
          }
        }
      } catch (error) {
        console.warn('Failed to load saved certificate data:', error);
      }
    }

    // Return default certificate data
    return {
      id: generateSecureId(),
      certificateTitle: 'Certificate of Completion',
      statement: 'This is to certify that the above named individual has successfully completed all requirements and demonstrated proficiency in',
      student: {
        id: 'student-new',
        name: '',
        email: '',
        enrollmentDate: new Date().toISOString().split('T')[0]
      },
      course: {
        id: '',
        title: '',
        instructors: [{
          id: 'instructor-new',
          name: '',
          title: ''
        }],
        duration: '',
        completionDate: new Date().toISOString().split('T')[0],
        category: '',
        level: 'Beginner' as const,
        credentialId: generateSecureId(),
        totalHours: 0
      },
      institution: {
        id: 'inst-new',
        name: '',
        website: ''
      },
      template: mockTemplates[0],
      issueDate: new Date().toISOString().split('T')[0],
      verificationUrl: '',
      signature: {
        name: '',
        title: ''
      },
      language: 'en' as const
    };
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave && isDirty && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(certificateData));
        setLastSaved(new Date());
        setIsDirty(false);
      } catch (error) {
        console.error('Failed to save certificate data:', error);
      }
    }
  }, [certificateData, autoSave, storageKey, isDirty]);

  // Update field with validation and sanitization
  const updateField = useCallback((field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    
    setCertificateData(prev => {
      const keys = field.split('.');
      const newData = { ...prev };
      
      if (keys.length === 2) {
        const [parent, child] = keys;
        const parentKey = parent as keyof CertificateData;
        (newData[parentKey] as Record<string, unknown>)[child] = sanitizedValue;
      } else {
        const fieldKey = field as keyof CertificateData;
        (newData as Record<string, unknown>)[fieldKey] = sanitizedValue;
      }

      // Update verification URL when certificate ID changes
      if (field === 'id') {
        newData.verificationUrl = generateVerificationUrl(sanitizedValue);
      }

      return newData;
    });

    setIsDirty(true);
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [validationErrors.length]);

  // Update template
  const updateTemplate = useCallback((templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      setCertificateData(prev => ({
        ...prev,
        template
      }));
      setIsDirty(true);
    }
  }, []);

  // Generate new IDs
  const generateNewIds = useCallback(() => {
    const newId = generateSecureId();
    const newCredentialId = generateSecureId();
    
    setCertificateData(prev => ({
      ...prev,
      id: newId,
      course: {
        ...prev.course,
        credentialId: newCredentialId
      },
      verificationUrl: generateVerificationUrl(newId)
    }));
    setIsDirty(true);
  }, []);

  // Validate certificate data
  const validate = useCallback((): boolean => {
    const validation = validateCertificateIntegrity(certificateData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, [certificateData]);

  // Reset to default state
  const reset = useCallback(() => {
    setCertificateData({
      id: generateSecureId(),
      certificateTitle: 'Certificate of Completion',
      statement: 'This is to certify that the above named individual has successfully completed all requirements and demonstrated proficiency in',
      student: {
        id: 'student-new',
        name: '',
        email: '',
        enrollmentDate: new Date().toISOString().split('T')[0]
      },
      course: {
        id: '',
        title: '',
        instructors: [{
          id: 'instructor-new',
          name: '',
          title: ''
        }],
        duration: '',
        completionDate: new Date().toISOString().split('T')[0],
        category: '',
        level: 'Beginner',
        credentialId: generateSecureId(),
        totalHours: 0
      },
      institution: {
        id: 'inst-new',
        name: '',
        website: ''
      },
      template: mockTemplates[0],
      issueDate: new Date().toISOString().split('T')[0],
      verificationUrl: '',
      signature: {
        name: '',
        title: ''
      },
      language: 'en' as const
    });
    setValidationErrors([]);
    setIsDirty(false);
    
    // Clear from localStorage if autoSave is enabled
    if (autoSave && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [autoSave, storageKey]);

  // Load certificate data
  const loadCertificate = useCallback((data: CertificateData) => {
    const validation = validateCertificateIntegrity(data);
    if (validation.isValid) {
      setCertificateData(data);
      setValidationErrors([]);
      setIsDirty(true);
    } else {
      setValidationErrors(validation.errors);
      throw new Error(`Invalid certificate data: ${validation.errors.join(', ')}`);
    }
  }, []);

  // Check if rate limit allows action
  const checkRate = useCallback((action: string = 'generate'): boolean => {
    const identifier = `${certificateData.student.email || 'anonymous'}-${action}`;
    return checkRateLimit(identifier);
  }, [certificateData.student.email]);

  // Export certificate data
  const exportData = useCallback((): string => {
    return JSON.stringify(certificateData, null, 2);
  }, [certificateData]);

  // Import certificate data
  const importData = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      loadCertificate(data);
      return true;
    } catch {
      setValidationErrors(['Invalid JSON data']);
      return false;
    }
  }, [loadCertificate]);

  // Get form validation status
  const isValid = certificateData.student.name && 
                 certificateData.course.title && 
                 certificateData.course.instructors?.[0]?.name && 
                 certificateData.signature.name &&
                 certificateData.institution.name;

  return {
    // State
    certificateData,
    validationErrors,
    isDirty,
    lastSaved,
    isValid: Boolean(isValid),

    // Actions
    updateField,
    updateTemplate,
    generateNewIds,
    validate,
    reset,
    loadCertificate,
    checkRate,
    exportData,
    importData,

    // Computed values
    formCompletion: {
      student: Boolean(certificateData.student.name && certificateData.student.email),
      course: Boolean(certificateData.course.title && certificateData.course.instructors?.[0]?.name),
      signature: Boolean(certificateData.signature.name),
      institution: Boolean(certificateData.institution.name),
      overall: Boolean(isValid)
    }
  };
};
