'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Rect, Text, Line, Circle } from 'fabric';
import { CertificateData, CertificateTemplate } from '@/types/certificate';
import { generateVerificationHash } from '@/utils/security';

interface CertificateCanvasProps {
  certificateData: CertificateData;
  template: CertificateTemplate;
  onCanvasReady?: (canvas: Canvas) => void;
  editable?: boolean;
  showGrid?: boolean;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  certificateData,
  template,
  onCanvasReady,
  editable = false,
  showGrid = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createCertificateDesign = useCallback(async (
    canvas: Canvas,
    data: CertificateData,
    template: CertificateTemplate
  ) => {
    // Clear canvas
    canvas.clear();
    canvas.backgroundColor = template.backgroundColor;
    canvas.renderAll();

    // Add decorative border
    await addBorder(canvas, template);

    // Add background pattern
    await addBackgroundPattern(canvas, template);

    // Add certificate title
    await addTitle(canvas, template);

    // Add main text content
    await addMainContent(canvas, data, template);

    // Add student information
    await addStudentInfo(canvas, data, template);

    // Add course information
    await addCourseInfo(canvas, data, template);

    // Add signature section
    await addSignature(canvas, data, template);

    // Add security features
    await addSecurityFeatures(canvas, data, template);

    // Add footer information
    await addFooter(canvas, data, template);

    canvas.renderAll();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new Canvas(canvasRef.current, {
      width: 1024,
      height: 768,
      backgroundColor: template.backgroundColor,
      selection: editable,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Configure canvas for editing or display
    if (!editable) {
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    }

    // Create certificate design
    createCertificateDesign(canvas, certificateData, template);

    // Add grid if requested
    if (showGrid && editable) {
      addGrid(canvas);
    }

    setIsLoading(false);
    onCanvasReady?.(canvas);

    // Cleanup
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [certificateData, template, editable, showGrid, onCanvasReady, createCertificateDesign]);

  const addBorder = async (canvas: Canvas, template: CertificateTemplate) => {
    // Outer border
    const outerBorder = new Rect({
      left: 20,
      top: 20,
      width: (canvas.width || 1024) - 40,
      height: (canvas.height || 768) - 40,
      fill: 'transparent',
      stroke: template.borderColor,
      strokeWidth: 4,
      rx: 10,
      ry: 10,
      selectable: false,
    });

    // Inner decorative border
    const innerBorder = new Rect({
      left: 40,
      top: 40,
      width: (canvas.width || 1024) - 80,
      height: (canvas.height || 768) - 80,
      fill: 'transparent',
      stroke: template.borderColor,
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      rx: 5,
      ry: 5,
      selectable: false,
    });

    canvas.add(outerBorder, innerBorder);
  };

  const addBackgroundPattern = async (canvas: Canvas, template: CertificateTemplate) => {
    if (!template.backgroundPattern) return;

    const patternSize = 50;
    const canvasWidth = canvas.width || 1024;
    const canvasHeight = canvas.height || 768;

    for (let x = 0; x < canvasWidth; x += patternSize) {
      for (let y = 0; y < canvasHeight; y += patternSize) {
        const patternCircle = new Circle({
          left: x,
          top: y,
          radius: 2,
          fill: template.borderColor,
          opacity: 0.1,
          selectable: false,
          evented: false,
        });
        canvas.add(patternCircle);
      }
    }
  };

  const addTitle = async (canvas: Canvas, template: CertificateTemplate) => {
    const canvasWidth = canvas.width || 1024;
    const title = new Text('CERTIFICATE OF COMPLETION', {
      left: canvasWidth / 2,
      top: 120,
      fontSize: 42,
      fontFamily: 'Georgia, serif',
      fill: template.titleColor,
      fontWeight: 'bold',
      textAlign: 'center',
      originX: 'center',
      selectable: false,
    });

    const titleUnderline = new Rect({
      left: canvasWidth / 2,
      top: 175,
      width: 300,
      height: 3,
      fill: template.titleColor,
      originX: 'center',
      selectable: false,
    });

    canvas.add(title, titleUnderline);
  };

  const addMainContent = async (canvas: Canvas, data: CertificateData, template: CertificateTemplate) => {
    const canvasWidth = canvas.width || 1024;
    const mainText = new Text('This is to certify that', {
      left: canvasWidth / 2,
      top: 220,
      fontSize: 20,
      fontFamily: 'Arial, sans-serif',
      fill: template.textColor,
      textAlign: 'center',
      originX: 'center',
      selectable: false,
    });

    canvas.add(mainText);
  };

  const addStudentInfo = async (canvas: Canvas, data: CertificateData, template: CertificateTemplate) => {
    const canvasWidth = canvas.width || 1024;
    const studentName = new Text(data.student.name.toUpperCase(), {
      left: canvasWidth / 2,
      top: 270,
      fontSize: 36,
      fontFamily: 'Georgia, serif',
      fill: template.titleColor,
      fontWeight: 'bold',
      textAlign: 'center',
      originX: 'center',
      selectable: false,
    });

    const nameUnderline = new Line(
      [canvasWidth / 2 - 200, 320, canvasWidth / 2 + 200, 320],
      {
        stroke: template.textColor,
        strokeWidth: 1,
        selectable: false,
      }
    );

    canvas.add(studentName, nameUnderline);
  };

  const addCourseInfo = async (canvas: Canvas, data: CertificateData, template: CertificateTemplate) => {
    const canvasWidth = canvas.width || 1024;
    const completionText = new Text('has successfully completed the course', {
      left: canvasWidth / 2,
      top: 350,
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      fill: template.textColor,
      textAlign: 'center',
      originX: 'center',
      selectable: false,
    });

    const courseTitle = new Text(data.course.title, {
      left: canvasWidth / 2,
      top: 385,
      fontSize: 24,
      fontFamily: 'Georgia, serif',
      fill: template.titleColor,
      fontWeight: 'bold',
      textAlign: 'center',
      originX: 'center',
      selectable: false,
    });

    const instructor = new Text(`Instructed by: ${data.course.instructors.map(inst => inst.name).join(', ')}`, {
      left: canvasWidth / 2,
      top: 425,
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fill: template.textColor,
      textAlign: 'center',
      originX: 'center',
      selectable: false,
    });

    const duration = new Text(`Duration: ${data.course.duration} | Level: ${data.course.level}`, {
      left: canvasWidth / 2,
      top: 450,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fill: template.textColor,
      textAlign: 'center',
      originX: 'center',
      selectable: false,
    });

    canvas.add(completionText, courseTitle, instructor, duration);
  };

  const addSignature = async (canvas: Canvas, data: CertificateData, template: CertificateTemplate) => {
    const canvasWidth = canvas.width || 1024;
    // Date section
    const dateLabel = new Text('Date of Completion:', {
      left: 150,
      top: 550,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fill: template.textColor,
      selectable: false,
    });

    const dateValue = new Text(new Date(data.course.completionDate).toLocaleDateString(), {
      left: 150,
      top: 575,
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fill: template.titleColor,
      fontWeight: 'bold',
      selectable: false,
    });

    const dateLine = new Line([150, 595, 300, 595], {
      stroke: template.textColor,
      strokeWidth: 1,
      selectable: false,
    });

    // Signature section
    const signatureLabel = new Text('Authorized Signature:', {
      left: canvasWidth - 300,
      top: 550,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fill: template.textColor,
      selectable: false,
    });

    const signatureName = new Text(data.signature.name, {
      left: canvasWidth - 300,
      top: 575,
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fill: template.titleColor,
      fontWeight: 'bold',
      selectable: false,
    });

    const signatureTitle = new Text(data.signature.title, {
      left: canvasWidth - 300,
      top: 600,
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      fill: template.textColor,
      selectable: false,
    });

    const signatureLine = new Line([canvasWidth - 300, 595, canvasWidth - 150, 595], {
      stroke: template.textColor,
      strokeWidth: 1,
      selectable: false,
    });

    canvas.add(dateLabel, dateValue, dateLine, signatureLabel, signatureName, signatureTitle, signatureLine);
  };

  const addSecurityFeatures = async (canvas: Canvas, data: CertificateData, template: CertificateTemplate) => {
    const canvasWidth = canvas.width || 1024;
    // Verification hash
    const verificationHash = generateVerificationHash(data);
    const hashText = new Text(`Verification: ${verificationHash}`, {
      left: 60,
      top: 650,
      fontSize: 10,
      fontFamily: 'Courier New, monospace',
      fill: template.textColor,
      opacity: 0.7,
      selectable: false,
    });

    // Certificate ID
    const certId = new Text(`Certificate ID: ${data.id}`, {
      left: 60,
      top: 670,
      fontSize: 10,
      fontFamily: 'Courier New, monospace',
      fill: template.textColor,
      opacity: 0.7,
      selectable: false,
    });

    // Credential ID
    const credentialId = new Text(`Credential ID: ${data.course.credentialId}`, {
      left: 60,
      top: 690,
      fontSize: 10,
      fontFamily: 'Courier New, monospace',
      fill: template.textColor,
      opacity: 0.7,
      selectable: false,
    });

    // QR Code placeholder (simplified representation)
    const qrCode = new Rect({
      left: canvasWidth - 120,
      top: 650,
      width: 60,
      height: 60,
      fill: template.textColor,
      opacity: 0.1,
      selectable: false,
    });

    const qrLabel = new Text('QR Code', {
      left: canvasWidth - 105,
      top: 675,
      fontSize: 8,
      fontFamily: 'Arial, sans-serif',
      fill: template.textColor,
      textAlign: 'center',
      originX: 'center',
      selectable: false,
    });

    canvas.add(hashText, certId, credentialId, qrCode, qrLabel);
  };

  const addFooter = async (canvas: Canvas, data: CertificateData, template: CertificateTemplate) => {
    const canvasWidth = canvas.width || 1024;
    const canvasHeight = canvas.height || 768;
    const footerText = new Text(
      `Issued on ${new Date(data.issueDate).toLocaleDateString()} | Verify at: ${data.verificationUrl}`,
      {
        left: canvasWidth / 2,
        top: canvasHeight - 40,
        fontSize: 10,
        fontFamily: 'Arial, sans-serif',
        fill: template.textColor,
        opacity: 0.8,
        textAlign: 'center',
        originX: 'center',
        selectable: false,
      }
    );

    canvas.add(footerText);
  };

  const addGrid = (canvas: Canvas) => {
    const gridSize = 20;
    const gridColor = '#ddd';
    const canvasWidth = canvas.width || 1024;
    const canvasHeight = canvas.height || 768;

    // Vertical lines
    for (let i = 0; i <= canvasWidth / gridSize; i++) {
      const line = new Line([i * gridSize, 0, i * gridSize, canvasHeight], {
        stroke: gridColor,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
      });
      canvas.add(line);
    }

    // Horizontal lines
    for (let i = 0; i <= canvasHeight / gridSize; i++) {
      const line = new Line([0, i * gridSize, canvasWidth, i * gridSize], {
        stroke: gridColor,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
      });
      canvas.add(line);
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Generating certificate...</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`border rounded-lg shadow-sm ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};
