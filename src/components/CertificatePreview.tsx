"use client";

import React from "react";
import { CertificateData } from "@/types/certificate";
import { generateVerificationHash } from "@/utils/security";
import Image from "next/image";

interface CertificatePreviewProps {
  certificateData: CertificateData;
  className?: string;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificateData,
  className = "",
}) => {
  const verificationHash = generateVerificationHash(certificateData);

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
        border: `4px solid ${certificateData.template.borderColor}`,
        borderRadius: "10px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, ${certificateData.template.borderColor} 2px, transparent 2px)`,
          backgroundSize: "50px 50px",
          borderRadius: "10px",
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
      <div className="relative z-10 h-full flex flex-col justify-between p-16">
        {/* Header Section */}
        <div className="text-center">
          {/* Institution Logo Area */}
          {certificateData.institution.logoUrl && (
            <div className="mb-4">
              <Image
                src={certificateData.institution.logoUrl}
                alt={`${certificateData.institution.name} Logo`}
                className="h-16 mx-auto"
                width={80}
                height={80}
              />
            </div>
          )}

          {/* Institution Name */}
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: certificateData.template.textColor }}
          >
            {certificateData.institution.name}
          </h2>

          {/* Certificate Title */}
          <h1
            className="text-5xl font-bold mb-4"
            style={{
              color: certificateData.template.titleColor,
              fontFamily: "Georgia, serif",
              letterSpacing: "2px",
            }}
          >
            {certificateData.certificateTitle.toUpperCase()}
          </h1>
          <div
            className="w-80 h-1 mx-auto mb-8"
            style={{ backgroundColor: certificateData.template.titleColor }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col justify-center text-center space-y-6">
          <p
            className="text-xl"
            style={{ color: certificateData.template.textColor }}
          >
            {certificateData.statement}
          </p>

          <div>
            <h2
              className="text-4xl font-bold mb-4"
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
              className="w-96 h-px mx-auto"
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
            <p
              className="text-base mb-2"
              style={{ color: certificateData.template.textColor }}
            >
              Instructed by:{" "}
              {certificateData.course.instructors
                .map((instructor) => instructor.name)
                .join(", ")}
            </p>

            <div
              className="flex justify-center space-x-8 text-sm"
              style={{ color: certificateData.template.textColor }}
            >
              {certificateData.course.duration && (
                <span>Duration: {certificateData.course.duration}</span>
              )}
              <span>Level: {certificateData.course.level}</span>
              {certificateData.course.totalHours && (
                <span>Hours: {certificateData.course.totalHours}</span>
              )}
              {certificateData.course.grade && (
                <span>Grade: {certificateData.course.grade}</span>
              )}
            </div>

            {/* Skills Learned */}
            {certificateData.course.skillsLearned &&
              certificateData.course.skillsLearned.length > 0 && (
                <div className="mt-4">
                  <p
                    className="text-sm mb-2"
                    style={{ color: certificateData.template.textColor }}
                  >
                    Skills Demonstrated:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {certificateData.course.skillsLearned.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded"
                          style={{
                            backgroundColor: `${certificateData.template.accentColor}20`,
                            color: certificateData.template.accentColor,
                          }}
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          {/* Date Section */}
          <div className="text-left">
            <p
              className="text-sm mb-2"
              style={{ color: certificateData.template.textColor }}
            >
              Date of Completion:
            </p>
            <p
              className="text-base font-bold mb-2"
              style={{ color: certificateData.template.titleColor }}
            >
              {new Date(
                certificateData.course.completionDate
              ).toLocaleDateString()}
            </p>
            <div
              className="w-32 h-px"
              style={{ backgroundColor: certificateData.template.textColor }}
            />
          </div>

          {/* Center Logo/Badge Area */}
          <div className="text-center">
            {certificateData.credential?.badgeUrl ? (
              <Image
                src={certificateData.credential.badgeUrl}
                alt="Credential Badge"
                width={80}
                height={80}
                className="w-20 h-20 mx-auto mb-2"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-2 mx-auto"
                style={{
                  borderColor: certificateData.template.titleColor,
                  backgroundColor: `${certificateData.template.titleColor}10`,
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

            {/* Credential Information */}
            {(certificateData.credential?.specialization ||
              certificateData.credential?.track) && (
              <div
                className="text-xs"
                style={{ color: certificateData.template.textColor }}
              >
                {certificateData.credential?.specialization && (
                  <p>{certificateData.credential.specialization}</p>
                )}
                {certificateData.credential?.track && (
                  <p>{certificateData.credential.track}</p>
                )}
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="text-right">
            <p
              className="text-sm mb-2"
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
            <p
              className="text-sm mb-2"
              style={{ color: certificateData.template.textColor }}
            >
              {certificateData.signature.title}
            </p>
            <div
              className="w-32 h-px"
              style={{ backgroundColor: certificateData.template.textColor }}
            />
          </div>
        </div>

        {/* Security Section */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-left">
            <div
              className="text-xs opacity-70 space-y-1"
              style={{
                color: certificateData.template.textColor,
                fontFamily: "Courier New, monospace",
              }}
            >
              <p>Verification: {verificationHash}</p>
              <p>Certificate ID: {certificateData.id}</p>
              <p>Credential ID: {certificateData.course.credentialId}</p>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-right">
            <div
              className="w-16 h-16 border-2 flex items-center justify-center"
              style={{
                borderColor: certificateData.template.textColor,
                opacity: 0.3,
              }}
            >
              <span
                className="text-xs"
                style={{ color: certificateData.template.textColor }}
              >
                QR
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p
            className="text-xs opacity-80"
            style={{ color: certificateData.template.textColor }}
          >
            Issued on {new Date(certificateData.issueDate).toLocaleDateString()}
            {certificateData.institution.website && (
              <> | {certificateData.institution.website}</>
            )}
          </p>
          <p
            className="text-xs opacity-60 mt-1"
            style={{ color: certificateData.template.textColor }}
          >
            Verify at: {certificateData.verificationUrl}
          </p>

          {/* Institution Accreditation */}
          {certificateData.institution.accreditation && (
            <p
              className="text-xs opacity-70 mt-2"
              style={{ color: certificateData.template.textColor }}
            >
              {certificateData.institution.accreditation}
            </p>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-8 left-8 w-16 h-16 rounded-full opacity-10"
        style={{ backgroundColor: certificateData.template.borderColor }}
      />
      <div
        className="absolute bottom-8 right-8 w-12 h-12 rounded-full opacity-10"
        style={{ backgroundColor: certificateData.template.borderColor }}
      />
      <div
        className="absolute top-1/2 left-4 w-2 h-20 opacity-5"
        style={{ backgroundColor: certificateData.template.borderColor }}
      />
      <div
        className="absolute top-1/2 right-4 w-2 h-20 opacity-5"
        style={{ backgroundColor: certificateData.template.borderColor }}
      />
    </div>
  );
};
