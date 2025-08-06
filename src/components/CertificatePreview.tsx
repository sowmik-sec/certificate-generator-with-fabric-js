"use client";

import React from "react";
import { CertificateData } from "@/types/certificate";

interface CertificatePreviewProps {
  certificateData: CertificateData;
  className?: string;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificateData,
  className = "",
}) => {
  return (
    <div
      id="certificate-preview"
      className={`certificate-container ${className}`}
      style={{
        width: "1024px",
        height: "768px",
        backgroundColor: certificateData.template.backgroundColor,
        position: "relative",
        fontFamily: "Arial, sans-serif",
        border: `3px solid ${certificateData.template.borderColor}`,
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, ${certificateData.template.borderColor} 2px, transparent 2px)`,
          backgroundSize: "50px 50px",
          borderRadius: "8px",
          opacity: 0.05,
        }}
      />

      {/* Inner Border */}
      <div
        className="absolute"
        style={{
          left: "20px",
          top: "20px",
          right: "20px",
          bottom: "20px",
          border: `1px dashed ${certificateData.template.borderColor}`,
          borderRadius: "5px",
          opacity: 0.3,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        {/* Header Section */}
        <div className="text-center">
          {/* Institution Logo Area */}
          {certificateData.institution.logoUrl && (
            <div className="mb-3">
              <img
                src={certificateData.institution.logoUrl}
                alt={`${certificateData.institution.name} Logo`}
                className="h-12 mx-auto"
                style={{ height: "48px", width: "auto", maxWidth: "64px" }}
              />
            </div>
          )}

          {/* Institution Name */}
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: certificateData.template.textColor }}
          >
            {certificateData.institution.name}
          </h2>

          {/* Certificate Title */}
          <h1
            className="text-4xl font-bold mb-3"
            style={{
              color: certificateData.template.titleColor,
              fontFamily: "Georgia, serif",
              letterSpacing: "1px",
            }}
          >
            {certificateData.certificateTitle.toUpperCase()}
          </h1>
          <div
            className="w-64 h-1 mx-auto mb-6"
            style={{ backgroundColor: certificateData.template.titleColor }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col justify-center text-center space-y-4">
          <p
            className="text-lg"
            style={{ color: certificateData.template.textColor }}
          >
            This is to certify that
          </p>

          <div>
            <h2
              className="text-3xl font-bold mb-3"
              style={{
                color: certificateData.template.titleColor,
                fontFamily: "Georgia, serif",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {certificateData.student.name}
            </h2>
            <div
              className="w-80 h-px mx-auto"
              style={{ backgroundColor: certificateData.template.textColor }}
            />
          </div>

          <p
            className="text-lg"
            style={{ color: certificateData.template.textColor }}
          >
            has successfully completed the course
          </p>

          <div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{
                color: certificateData.template.titleColor,
                fontFamily: "Georgia, serif",
              }}
            >
              {certificateData.course.title}
            </h3>

            {certificateData.course.instructors &&
              certificateData.course.instructors.length > 0 &&
              certificateData.course.instructors[0].name && (
                <p
                  className="text-base mb-2"
                  style={{ color: certificateData.template.textColor }}
                >
                  Instructed by: {certificateData.course.instructors[0].name}
                </p>
              )}

            <div
              className="flex justify-center space-x-6 text-sm mt-3"
              style={{ color: certificateData.template.textColor }}
            >
              {certificateData.course.duration && (
                <span>Duration: {certificateData.course.duration}</span>
              )}
              <span>Level: {certificateData.course.level}</span>
              {certificateData.course.grade && (
                <span>Grade: {certificateData.course.grade}</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          {/* Date Section */}
          <div className="text-left">
            <p
              className="text-sm mb-1"
              style={{ color: certificateData.template.textColor }}
            >
              Date of Completion:
            </p>
            <p
              className="text-base font-bold"
              style={{ color: certificateData.template.titleColor }}
            >
              {new Date(
                certificateData.course.completionDate
              ).toLocaleDateString()}
            </p>
            <div
              className="w-24 h-px mt-1"
              style={{ backgroundColor: certificateData.template.textColor }}
            />
          </div>

          {/* Center Badge Area */}
          <div className="text-center">
            {certificateData.credential?.badgeUrl ? (
              <img
                src={certificateData.credential.badgeUrl}
                alt="Credential Badge"
                className="w-15 h-15 mx-auto"
                style={{ width: "60px", height: "60px", objectFit: "contain" }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full border-3 flex items-center justify-center mx-auto"
                style={{
                  borderColor: certificateData.template.titleColor,
                  backgroundColor: `${certificateData.template.titleColor}15`,
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: certificateData.template.titleColor }}
                >
                  CERTIFIED
                </span>
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="text-right">
            <p
              className="text-sm mb-1"
              style={{ color: certificateData.template.textColor }}
            >
              Authorized Signature:
            </p>
            <p
              className="text-base font-bold"
              style={{ color: certificateData.template.titleColor }}
            >
              {certificateData.signature.name}
            </p>
            {certificateData.signature.title && (
              <p
                className="text-sm"
                style={{ color: certificateData.template.textColor }}
              >
                {certificateData.signature.title}
              </p>
            )}
            <div
              className="w-24 h-px mt-1 ml-auto"
              style={{ backgroundColor: certificateData.template.textColor }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p
            className="text-xs"
            style={{
              color: certificateData.template.textColor,
              opacity: 0.8,
            }}
          >
            Issued on {new Date(certificateData.issueDate).toLocaleDateString()}
            {certificateData.institution.website && (
              <> | {certificateData.institution.website}</>
            )}
          </p>

          <div className="flex justify-between items-center mt-3">
            {/* Certificate ID - Left side with full visibility */}
            <div
              className="text-xs flex-1 text-left"
              style={{
                color: certificateData.template.textColor,
                fontFamily: "monospace",
                opacity: 0.6,
              }}
            >
              Certificate ID: {certificateData.id}
            </div>

            {/* QR Placeholder - Right side, smaller */}
            <div
              className="w-6 h-6 border flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: certificateData.template.textColor,
                opacity: 0.4,
              }}
            >
              <span
                className="text-xs"
                style={{
                  color: certificateData.template.textColor,
                  fontSize: "6px",
                }}
              >
                QR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-8 left-8 w-16 h-16 rounded-full"
        style={{
          backgroundColor: certificateData.template.borderColor,
          opacity: 0.1,
        }}
      />
      <div
        className="absolute bottom-8 right-8 w-12 h-12 rounded-full"
        style={{
          backgroundColor: certificateData.template.borderColor,
          opacity: 0.1,
        }}
      />
      <div
        className="absolute w-2 h-20"
        style={{
          top: "50%",
          left: "16px",
          transform: "translateY(-50%)",
          backgroundColor: certificateData.template.borderColor,
          opacity: 0.05,
        }}
      />
      <div
        className="absolute w-2 h-20"
        style={{
          top: "50%",
          right: "16px",
          transform: "translateY(-50%)",
          backgroundColor: certificateData.template.borderColor,
          opacity: 0.05,
        }}
      />
    </div>
  );
};
