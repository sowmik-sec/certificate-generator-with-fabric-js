'use client';

import React, { useState, useRef, useCallback } from 'react';
import { CertificateData } from '@/types/certificate';
import { mockTemplates, mockCourseOptions, generateSecureId, generateVerificationUrl } from '@/data/mockData';
import { sanitizeInput, validateCertificateIntegrity, checkRateLimit } from '@/utils/security';
import { 
  generatePDFFromElement, 
  generateFileName, 
  downloadBlob, 
  previewPDF, 
  validatePDFRequirements 
} from '@/utils/pdfGenerator';
import { CertificatePreview } from './CertificatePreview';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Eye, 
  RefreshCw, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Palette,
  FileText
} from 'lucide-react';

export const CertificateGenerator: React.FC = () => {
  const [certificateData, setCertificateData] = useState<CertificateData>(() => ({
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
    language: 'en'
  }));

  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('form');
  
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle form field changes with validation
  const handleFieldChange = useCallback((field: string, value: string) => {
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

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [validationErrors.length]);

  // Handle template change
  const handleTemplateChange = useCallback((templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      setCertificateData(prev => ({
        ...prev,
        template
      }));
    }
  }, []);

  // Handle course selection
  const handleCourseChange = useCallback((courseId: string) => {
    const course = mockCourseOptions.find(c => c.id === courseId);
    if (course) {
      setCertificateData(prev => ({
        ...prev,
        course: {
          ...prev.course,
          id: course.id,
          title: course.title,
          instructors: course.instructors,
          category: course.category,
          level: course.level,
          totalHours: course.totalHours || 0,
          skillsLearned: course.skillsLearned
        }
      }));
    }
  }, []);

  // Generate new certificate ID
  const generateNewId = useCallback(() => {
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
  }, []);

  // Validate certificate data
  const validateData = useCallback((): boolean => {
    const validation = validateCertificateIntegrity(certificateData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, [certificateData]);

  // Generate and download PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!validateData()) {
      return;
    }

    // Check rate limit
    const clientId = `${certificateData.student.email || 'anonymous'}-${Date.now()}`;
    if (!checkRateLimit(clientId)) {
      setValidationErrors(['Too many requests. Please wait before generating another certificate.']);
      return;
    }

    setIsGenerating(true);
    
    try {
      const pdfRequirements = validatePDFRequirements();
      if (!pdfRequirements.isSupported) {
        throw new Error(`PDF generation not supported: ${pdfRequirements.errors.join(', ')}`);
      }

      const previewElement = document.getElementById('certificate-preview');
      if (!previewElement) {
        throw new Error('Certificate preview element not found');
      }

      const pdfBlob = await generatePDFFromElement(
        previewElement as HTMLElement,
        certificateData,
        {
          format: 'A4',
          orientation: 'landscape',
          quality: 1.0,
          includeWatermark: true,
          includeMetadata: true
        }
      );

      const filename = generateFileName(certificateData);
      downloadBlob(pdfBlob, filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setValidationErrors([
        error instanceof Error ? error.message : 'Failed to generate PDF'
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [certificateData, validateData]);

  // Preview PDF in new tab
  const handlePreviewPDF = useCallback(async () => {
    if (!validateData()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const previewElement = document.getElementById('certificate-preview');
      if (!previewElement) {
        throw new Error('Certificate preview element not found');
      }

      const pdfBlob = await generatePDFFromElement(
        previewElement as HTMLElement,
        certificateData,
        { includeWatermark: false } // No watermark for preview
      );

      previewPDF(pdfBlob);

    } catch (error) {
      console.error('Error previewing PDF:', error);
      setValidationErrors([
        error instanceof Error ? error.message : 'Failed to preview PDF'
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [certificateData, validateData]);

  const isFormValid = certificateData.student.name && 
                     certificateData.course.title && 
                     certificateData.course.instructors?.[0]?.name && 
                     certificateData.signature.name &&
                     certificateData.institution.name;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificate Generator
          </h1>
          <p className="text-gray-600">
            Generate professional certificates for course completions with security features
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Forms and Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Validation Alerts */}
            {validationErrors.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Validation Errors:</p>
                      <ul className="mt-2 text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Certificate Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="form">Student</TabsTrigger>
                    <TabsTrigger value="course">Course</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                  </TabsList>

                  {/* Student Information Tab */}
                  <TabsContent value="form" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="certificate-title">Certificate Title *</Label>
                      <Input
                        id="certificate-title"
                        value={certificateData.certificateTitle}
                        onChange={(e) => handleFieldChange('certificateTitle', e.target.value)}
                        placeholder="e.g., Certificate of Completion"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="student-name">Student Name *</Label>
                      <Input
                        id="student-name"
                        value={certificateData.student.name}
                        onChange={(e) => handleFieldChange('student.name', e.target.value)}
                        placeholder="Enter student's full name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="student-email">Student Email *</Label>
                      <Input
                        id="student-email"
                        type="email"
                        value={certificateData.student.email}
                        onChange={(e) => handleFieldChange('student.email', e.target.value)}
                        placeholder="student@example.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="institution-name">Institution Name *</Label>
                      <Input
                        id="institution-name"
                        value={certificateData.institution.name}
                        onChange={(e) => handleFieldChange('institution.name', e.target.value)}
                        placeholder="Enter institution name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="completion-date">Completion Date</Label>
                      <Input
                        id="completion-date"
                        type="date"
                        value={certificateData.course.completionDate}
                        onChange={(e) => handleFieldChange('course.completionDate', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>

                  {/* Course Information Tab */}
                  <TabsContent value="course" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="course-select">Select Course</Label>
                      <Select onValueChange={handleCourseChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCourseOptions.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="course-title">Course Title *</Label>
                      <Input
                        id="course-title"
                        value={certificateData.course.title}
                        onChange={(e) => handleFieldChange('course.title', e.target.value)}
                        placeholder="Enter course title"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructor">Instructor Name *</Label>
                      <Input
                        id="instructor"
                        value={certificateData.course.instructors[0]?.name || ''}
                        onChange={(e) => {
                          const newData = { ...certificateData };
                          if (!newData.course.instructors[0]) {
                            newData.course.instructors[0] = { id: 'instructor-1', name: '' };
                          }
                          newData.course.instructors[0].name = e.target.value;
                          setCertificateData(newData);
                        }}
                        placeholder="Enter instructor name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructor-title">Instructor Title</Label>
                      <Input
                        id="instructor-title"
                        value={certificateData.course.instructors[0]?.title || ''}
                        onChange={(e) => {
                          const newData = { ...certificateData };
                          if (!newData.course.instructors[0]) {
                            newData.course.instructors[0] = { id: 'instructor-1', name: '' };
                          }
                          newData.course.instructors[0].title = e.target.value;
                          setCertificateData(newData);
                        }}
                        placeholder="e.g., Senior Developer"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="total-hours">Total Hours</Label>
                      <Input
                        id="total-hours"
                        type="number"
                        value={certificateData.course.totalHours || ''}
                        onChange={(e) => handleFieldChange('course.totalHours', e.target.value)}
                        placeholder="e.g., 120"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="grade">Grade (Optional)</Label>
                      <Input
                        id="grade"
                        value={certificateData.course.grade || ''}
                        onChange={(e) => handleFieldChange('course.grade', e.target.value)}
                        placeholder="e.g., A, 95%, Pass"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Course Duration</Label>
                      <Input
                        id="duration"
                        value={certificateData.course.duration}
                        onChange={(e) => handleFieldChange('course.duration', e.target.value)}
                        placeholder="e.g., 12 weeks, 40 hours"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="level">Course Level</Label>
                      <Select 
                        value={certificateData.course.level} 
                        onValueChange={(value: string) => handleFieldChange('course.level', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="signature-name">Signature Name *</Label>
                      <Input
                        id="signature-name"
                        value={certificateData.signature.name}
                        onChange={(e) => handleFieldChange('signature.name', e.target.value)}
                        placeholder="Enter signatory name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signature-title">Signature Title</Label>
                      <Input
                        id="signature-title"
                        value={certificateData.signature.title}
                        onChange={(e) => handleFieldChange('signature.title', e.target.value)}
                        placeholder="e.g., Chief Academic Officer"
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>

                  {/* Design Tab */}
                  <TabsContent value="design" className="space-y-4 mt-4">
                    <div>
                      <Label>Certificate Template</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {mockTemplates.map((template) => (
                          <div
                            key={template.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              certificateData.template.id === template.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleTemplateChange(template.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{template.name}</span>
                              <div className="flex space-x-1">
                                <div 
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: template.backgroundColor }}
                                />
                                <div 
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: template.borderColor }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verification Hash</span>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Certificate ID</span>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">QR Code</span>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">PDF Watermark</span>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateNewId}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New IDs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    onClick={handlePreviewPDF}
                    disabled={!isFormValid || isGenerating}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview PDF
                  </Button>
                  
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={!isFormValid || isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Generating...' : 'Download PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Certificate Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Certificate Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={previewRef} 
                  className="flex justify-center overflow-hidden rounded-lg bg-gray-100 p-4"
                  style={{ minHeight: '500px' }}
                >
                  <div className="transform scale-75 origin-top">
                    <CertificatePreview certificateData={certificateData} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
