"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, Rect, Text, Line, Circle, FabricImage } from "fabric";
import { CertificateData, CertificateTemplate } from "@/types/certificate";
import { generateVerificationHash } from "@/utils/security";
import { loadOptimizedImage } from "@/utils/imageLoader";

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
  showGrid = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const onCanvasReadyRef = useRef(onCanvasReady);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track text elements for efficient updates
  const textElementsRef = useRef<{
    studentName?: Text;
    courseTitle?: Text;
    instructor?: Text;
    duration?: Text;
    grade?: Text;
    signatureName?: Text;
    signatureTitle?: Text;
    institutionName?: Text;
    dateValue?: Text;
    certId?: Text;
    credentialId?: Text;
    hashText?: Text;
    footerText?: Text;
  }>({});

  // Update the ref when onCanvasReady changes
  onCanvasReadyRef.current = onCanvasReady;

  // Function to update text elements without full refresh
  const updateTextElements = useCallback((canvas: Canvas, data: CertificateData, template: CertificateTemplate) => {
    const elements = textElementsRef.current;
    
    // Update student name
    if (elements.studentName) {
      elements.studentName.set('text', data.student.name.toUpperCase());
      elements.studentName.set('fill', template.titleColor);
    }
    
    // Update course title
    if (elements.courseTitle) {
      elements.courseTitle.set('text', data.course.title);
      elements.courseTitle.set('fill', template.titleColor);
    }
    
    // Update instructor
    if (elements.instructor && data.course.instructors.length > 0) {
      elements.instructor.set('text', `Instructed by: ${data.course.instructors.map(inst => inst.name).join(', ')}`);
      elements.instructor.set('fill', template.textColor);
    }
    
    // Update duration and level
    if (elements.duration) {
      elements.duration.set('text', `Duration: ${data.course.duration} | Level: ${data.course.level}`);
      elements.duration.set('fill', template.textColor);
    }
    
    // Update grade
    if (elements.grade && data.course.grade && data.course.grade.trim()) {
      elements.grade.set('text', `Grade: ${data.course.grade}`);
      elements.grade.set('fill', template.titleColor);
      elements.grade.set('opacity', 1);
    } else if (elements.grade) {
      elements.grade.set('opacity', 0);
    }
    
    // Update signature name
    if (elements.signatureName) {
      elements.signatureName.set('text', data.signature.name);
      elements.signatureName.set('fill', template.titleColor);
    }
    
    // Update signature title
    if (elements.signatureTitle) {
      elements.signatureTitle.set('text', data.signature.title);
      elements.signatureTitle.set('fill', template.textColor);
    }
    
    // Update institution name
    if (elements.institutionName) {
      elements.institutionName.set('text', data.institution.name);
      elements.institutionName.set('fill', template.titleColor);
      // Show or hide based on whether there's content
      if (data.institution.name && data.institution.name.trim()) {
        elements.institutionName.set('opacity', 1);
      } else {
        elements.institutionName.set('opacity', 0);
      }
    }
    
    // Update date
    if (elements.dateValue) {
      elements.dateValue.set('text', new Date(data.course.completionDate).toLocaleDateString());
      elements.dateValue.set('fill', template.titleColor);
    }
    
    // Update certificate ID
    if (elements.certId) {
      elements.certId.set('text', `Certificate ID: ${data.id}`);
      elements.certId.set('fill', template.textColor);
    }
    
    // Update credential ID
    if (elements.credentialId) {
      elements.credentialId.set('text', `Credential ID: ${data.course.credentialId}`);
      elements.credentialId.set('fill', template.textColor);
    }
    
    // Update verification hash
    if (elements.hashText) {
      const verificationHash = generateVerificationHash(data);
      elements.hashText.set('text', `Verification: ${verificationHash}`);
      elements.hashText.set('fill', template.textColor);
    }
    
    // Update footer
    if (elements.footerText) {
      elements.footerText.set('text', `Issued on ${new Date(data.issueDate).toLocaleDateString()} | Verify at: ${data.verificationUrl}`);
      elements.footerText.set('fill', template.textColor);
    }
    
    // Update canvas background color
    canvas.backgroundColor = template.backgroundColor;
    
    canvas.renderAll();
  }, []);

  const createCertificateDesign = async (
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

    // Add logo
    await addLogo(canvas, data, template);

    // Add background pattern
    await addBackgroundPattern(canvas, template);

    // Add certificate title
    await addTitle(canvas, template);

    // Add main text content
    await addMainContent(canvas, data, template);

    // Add student information
    const studentName = await addStudentInfo(canvas, data, template);
    textElementsRef.current.studentName = studentName;

    // Add course information
    const courseElements = await addCourseInfo(canvas, data, template);
    textElementsRef.current.courseTitle = courseElements.courseTitle;
    textElementsRef.current.instructor = courseElements.instructor;
    textElementsRef.current.duration = courseElements.duration;
    textElementsRef.current.grade = courseElements.grade;

    // Add signature section
    const signatureElements = await addSignature(canvas, data, template);
    textElementsRef.current.signatureName = signatureElements.signatureName;
    textElementsRef.current.signatureTitle = signatureElements.signatureTitle;
    textElementsRef.current.institutionName = signatureElements.institutionName;
    textElementsRef.current.dateValue = signatureElements.dateValue;

    // Add security features
    const securityElements = await addSecurityFeatures(canvas, data, template);
    textElementsRef.current.certId = securityElements.certId;
    textElementsRef.current.credentialId = securityElements.credentialId;
    textElementsRef.current.hashText = securityElements.hashText;

    // Add footer information
    const footerElements = await addFooter(canvas, data, template);
    textElementsRef.current.footerText = footerElements.footerText;

    canvas.renderAll();
  };

  // Initialize canvas only once
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

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

    // Call onCanvasReady if provided - using ref to avoid dependency
    if (onCanvasReadyRef.current) {
      onCanvasReadyRef.current(canvas);
    }

    // Cleanup
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      textElementsRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, showGrid]); // Only re-initialize if editable or showGrid changes
  
  // Update canvas elements when certificate data changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    updateTextElements(canvas, certificateData, template);
  }, [certificateData, template, updateTextElements]);

  const addLogo = async (
    canvas: Canvas,
    data: CertificateData,
    template: CertificateTemplate
  ) => {
    try {
      // Determine logo URL with priority: user > template > default
      let logoUrl = "";

      if (data.institution.logoUrl && data.institution.logoUrl.trim()) {
        logoUrl = data.institution.logoUrl.trim();
        console.log("Using user logo URL:", logoUrl);
      } else if (template.logoUrl && template.logoUrl.trim()) {
        logoUrl = template.logoUrl.trim();
        console.log("Using template logo URL:", logoUrl);
      } else {
        logoUrl = "/default-logo.svg";
        console.log("Using default logo URL:", logoUrl);
      }

      console.log("Final logo URL selected:", logoUrl);

      // For external URLs, try loading directly without optimization first
      if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
        console.log("Loading external logo directly...");

        const img = new Image();
        img.crossOrigin = "anonymous";

        const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => {
            console.log("External logo loaded successfully:", logoUrl);
            resolve(img);
          };
          img.onerror = (error) => {
            console.warn("Failed to load external logo:", logoUrl, error);
            reject(error);
          };
        });

        img.src = logoUrl;

        try {
          const loadedImg = await loadPromise;
          const logoImg = new FabricImage(loadedImg);

          const canvasWidth = canvas.width || 1024;
          const maxLogoWidth = 120;
          const maxLogoHeight = 80;

          // Calculate scaling to maintain aspect ratio
          const scaleX = maxLogoWidth / logoImg.width!;
          const scaleY = maxLogoHeight / logoImg.height!;
          const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

          logoImg.set({
            left: canvasWidth / 2, // Center horizontally
            top: 50,
            scaleX: scale,
            scaleY: scale,
            originX: "center", // Center the logo
            selectable: false,
            evented: false,
            opacity: 0.9,
          });

          canvas.add(logoImg);
          console.log("External logo added successfully to canvas");
          return;
        } catch {
          console.warn("External logo failed, trying with optimization...");
        }
      }

      // Fallback to optimized loading (for local files or if external failed)
      const optimizedImg = await loadOptimizedImage(logoUrl, {
        maxWidth: 150,
        maxHeight: 100,
        quality: 0.9,
        fallbackUrl: "/default-logo.svg",
      });

      if (optimizedImg) {
        // Create Fabric.js image from the optimized HTML image
        const logoImg = new FabricImage(optimizedImg);

        const canvasWidth = canvas.width || 1024;
        const maxLogoWidth = 120;
        const maxLogoHeight = 80;

        // Calculate scaling to maintain aspect ratio
        const scaleX = maxLogoWidth / logoImg.width!;
        const scaleY = maxLogoHeight / logoImg.height!;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

        logoImg.set({
          left: canvasWidth / 2, // Center horizontally
          top: 50,
          scaleX: scale,
          scaleY: scale,
          originX: "center", // Center the logo
          selectable: false,
          evented: false,
          opacity: 0.9,
        });

        canvas.add(logoImg);
        console.log("Optimized logo added successfully with URL:", logoUrl);
      } else {
        throw new Error("Failed to load logo image");
      }
    } catch (error) {
      console.warn("Failed to load logo:", error);
      // Add text placeholder if logo fails to load
      const logoPlaceholder = new Text("LOGO", {
        left: (canvas.width || 1024) / 2,
        top: 70,
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        fill: template.textColor,
        textAlign: "center",
        originX: "center",
        selectable: false,
        opacity: 0.5,
      });
      canvas.add(logoPlaceholder);
    }
  };

  const addBorder = async (canvas: Canvas, template: CertificateTemplate) => {
    // Outer border
    const outerBorder = new Rect({
      left: 20,
      top: 20,
      width: (canvas.width || 1024) - 40,
      height: (canvas.height || 768) - 40,
      fill: "transparent",
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
      fill: "transparent",
      stroke: template.borderColor,
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      rx: 5,
      ry: 5,
      selectable: false,
    });

    canvas.add(outerBorder, innerBorder);
  };

  const addBackgroundPattern = async (
    canvas: Canvas,
    template: CertificateTemplate
  ) => {
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
    const title = new Text("CERTIFICATE OF COMPLETION", {
      left: canvasWidth / 2,
      top: 140, // Moved down to make room for centered logo
      fontSize: 42,
      fontFamily: "Georgia, serif",
      fill: template.titleColor,
      fontWeight: "bold",
      textAlign: "center",
      originX: "center",
      selectable: false,
    });

    const titleUnderline = new Rect({
      left: canvasWidth / 2,
      top: 195, // Adjusted accordingly
      width: 300,
      height: 3,
      fill: template.titleColor,
      originX: "center",
      selectable: false,
    });

    canvas.add(title, titleUnderline);
  };

  const addMainContent = async (
    canvas: Canvas,
    data: CertificateData,
    template: CertificateTemplate
  ) => {
    const canvasWidth = canvas.width || 1024;
    const mainText = new Text("This is to certify that", {
      left: canvasWidth / 2,
      top: 220,
      fontSize: 20,
      fontFamily: "Arial, sans-serif",
      fill: template.textColor,
      textAlign: "center",
      originX: "center",
      selectable: false,
    });

    canvas.add(mainText);
  };

  const addStudentInfo = async (
    canvas: Canvas,
    data: CertificateData,
    template: CertificateTemplate
  ): Promise<Text> => {
    const canvasWidth = canvas.width || 1024;
    const studentName = new Text(data.student.name.toUpperCase(), {
      left: canvasWidth / 2,
      top: 270,
      fontSize: 36,
      fontFamily: "Georgia, serif",
      fill: template.titleColor,
      fontWeight: "bold",
      textAlign: "center",
      originX: "center",
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
    return studentName;
  };

  const addCourseInfo = async (
    canvas: Canvas,
    data: CertificateData,
    template: CertificateTemplate
  ) => {
    const canvasWidth = canvas.width || 1024;
    const completionText = new Text("has successfully completed the course", {
      left: canvasWidth / 2,
      top: 350,
      fontSize: 18,
      fontFamily: "Arial, sans-serif",
      fill: template.textColor,
      textAlign: "center",
      originX: "center",
      selectable: false,
    });

    const courseTitle = new Text(data.course.title, {
      left: canvasWidth / 2,
      top: 385,
      fontSize: 24,
      fontFamily: "Georgia, serif",
      fill: template.titleColor,
      fontWeight: "bold",
      textAlign: "center",
      originX: "center",
      selectable: false,
    });

    const instructor = new Text(
      `Instructed by: ${data.course.instructors
        .map((inst) => inst.name)
        .join(", ")}`,
      {
        left: canvasWidth / 2,
        top: 425,
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        fill: template.textColor,
        textAlign: "center",
        originX: "center",
        selectable: false,
      }
    );

    const duration = new Text(
      `Duration: ${data.course.duration} | Level: ${data.course.level}`,
      {
        left: canvasWidth / 2,
        top: 450,
        fontSize: 14,
        fontFamily: "Arial, sans-serif",
        fill: template.textColor,
        textAlign: "center",
        originX: "center",
        selectable: false,
      }
    );

    // Add grade if provided or create hidden grade text
    let gradeText: Text | null = null;
    if (data.course.grade && data.course.grade.trim()) {
      gradeText = new Text(`Grade: ${data.course.grade}`, {
        left: canvasWidth / 2,
        top: 470,
        fontSize: 16,
        fontFamily: "Georgia, serif",
        fill: template.titleColor,
        fontWeight: "bold",
        textAlign: "center",
        originX: "center",
        selectable: false,
      });
    } else {
      // Create hidden grade text for later updates
      gradeText = new Text("", {
        left: canvasWidth / 2,
        top: 470,
        fontSize: 16,
        fontFamily: "Georgia, serif",
        fill: template.titleColor,
        fontWeight: "bold",
        textAlign: "center",
        originX: "center",
        selectable: false,
        opacity: 0,
      });
    }

    canvas.add(completionText, courseTitle, instructor, duration, gradeText);
    
    return {
      courseTitle,
      instructor,
      duration,
      grade: gradeText,
    };
  };

  const addSignature = async (
    canvas: Canvas,
    data: CertificateData,
    template: CertificateTemplate
  ) => {
    const canvasWidth = canvas.width || 1024;
    // Date section
    const dateLabel = new Text("Date of Completion:", {
      left: 150,
      top: 550,
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      fill: template.textColor,
      selectable: false,
    });

    const dateValue = new Text(
      new Date(data.course.completionDate).toLocaleDateString(),
      {
        left: 150,
        top: 575,
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        fill: template.titleColor,
        fontWeight: "bold",
        selectable: false,
      }
    );

    const dateLine = new Line([150, 595, 300, 595], {
      stroke: template.textColor,
      strokeWidth: 1,
      selectable: false,
    });

    // Signature section
    const signatureLabel = new Text("Authorized Signature:", {
      left: canvasWidth - 300,
      top: 550,
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      fill: template.textColor,
      selectable: false,
    });

    const signatureName = new Text(data.signature.name, {
      left: canvasWidth - 300,
      top: 575,
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      fill: template.titleColor,
      fontWeight: "bold",
      selectable: false,
    });

    const signatureTitle = new Text(data.signature.title, {
      left: canvasWidth - 300,
      top: 600,
      fontSize: 12,
      fontFamily: "Arial, sans-serif",
      fill: template.textColor,
      selectable: false,
    });

    const signatureLine = new Line(
      [canvasWidth - 300, 595, canvasWidth - 150, 595],
      {
        stroke: template.textColor,
        strokeWidth: 1,
        selectable: false,
      }
    );

    canvas.add(
      dateLabel,
      dateValue,
      dateLine,
      signatureLabel,
      signatureName,
      signatureTitle,
      signatureLine
    );

    // Institution name - always create elements
    const institutionLabel = new Text("Issued by:", {
      left: canvasWidth / 2,
      top: 500,
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      fill: template.textColor,
      textAlign: "center",
      originX: "center",
      selectable: false,
    });

    const institutionName = new Text(data.institution.name || "", {
      left: canvasWidth / 2,
      top: 520,
      fontSize: 18,
      fontFamily: "Georgia, serif",
      fill: template.titleColor,
      fontWeight: "bold",
      textAlign: "center",
      originX: "center",
      selectable: false,
      opacity: (data.institution.name && data.institution.name.trim()) ? 1 : 0,
    });

    canvas.add(institutionLabel, institutionName);
    
    return {
      dateValue,
      signatureName,
      signatureTitle,
      institutionName,
    };
  };

  const addSecurityFeatures = async (
    canvas: Canvas,
    data: CertificateData,
    template: CertificateTemplate
  ) => {
    const canvasWidth = canvas.width || 1024;
    // Verification hash
    const verificationHash = generateVerificationHash(data);
    const hashText = new Text(`Verification: ${verificationHash}`, {
      left: 60,
      top: 650,
      fontSize: 10,
      fontFamily: "Courier New, monospace",
      fill: template.textColor,
      opacity: 0.7,
      selectable: false,
    });

    // Certificate ID
    const certId = new Text(`Certificate ID: ${data.id}`, {
      left: 60,
      top: 670,
      fontSize: 10,
      fontFamily: "Courier New, monospace",
      fill: template.textColor,
      opacity: 0.7,
      selectable: false,
    });

    // Credential ID
    const credentialId = new Text(
      `Credential ID: ${data.course.credentialId}`,
      {
        left: 60,
        top: 690,
        fontSize: 10,
        fontFamily: "Courier New, monospace",
        fill: template.textColor,
        opacity: 0.7,
        selectable: false,
      }
    );

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

    const qrLabel = new Text("QR Code", {
      left: canvasWidth - 105,
      top: 675,
      fontSize: 8,
      fontFamily: "Arial, sans-serif",
      fill: template.textColor,
      textAlign: "center",
      originX: "center",
      selectable: false,
    });

    canvas.add(hashText, certId, credentialId, qrCode, qrLabel);
    
    return {
      hashText,
      certId,
      credentialId,
    };
  };

  const addFooter = async (
    canvas: Canvas,
    data: CertificateData,
    template: CertificateTemplate
  ) => {
    const canvasWidth = canvas.width || 1024;
    const canvasHeight = canvas.height || 768;
    const footerText = new Text(
      `Issued on ${new Date(
        data.issueDate
      ).toLocaleDateString()} | Verify at: ${data.verificationUrl}`,
      {
        left: canvasWidth / 2,
        top: canvasHeight - 40,
        fontSize: 10,
        fontFamily: "Arial, sans-serif",
        fill: template.textColor,
        opacity: 0.8,
        textAlign: "center",
        originX: "center",
        selectable: false,
      }
    );

    canvas.add(footerText);
    
    return {
      footerText,
    };
  };

  const addGrid = (canvas: Canvas) => {
    const gridSize = 20;
    const gridColor = "#ddd";
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
        className={`border rounded-lg shadow-sm ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity`}
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
};
