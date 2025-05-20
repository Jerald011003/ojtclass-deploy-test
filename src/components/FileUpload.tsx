"use client";

import { useCallback, useState } from "react";
import { UploadButton, UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";

interface FileUploadProps {
  endpoint: keyof typeof import("~/app/api/uploadthing/core").ourFileRouter;
  onUploadComplete?: (url: string) => void;
  onUploadBegin?: () => void;  
  onUploadError?: (error: Error) => void;  
  className?: string;
  isUploading?: boolean; 
}


export const FileUpload = ({
  endpoint,
  onUploadComplete,
  onUploadBegin,  
  onUploadError, 
  className = "",
}: FileUploadProps) => {
  const isUploadThingConfigured = true;

  const handleComplete = useCallback(
    (res: any[]) => {
      if (res?.[0]) {
        const fileUrl = res[0].url;
        if (fileUrl && onUploadComplete) {
          onUploadComplete(fileUrl);
        }
      }
    },
    [onUploadComplete]
  );

  if (!isUploadThingConfigured) {
    return (
      <div className={`${className} p-4 border border-dashed rounded-md text-center`}>
        <p className="text-sm font-medium text-red-500">File uploads are disabled.</p>
        <p className="text-xs text-gray-500 mt-1">UploadThing is not configured.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <UploadDropzone<OurFileRouter, FileUploadProps["endpoint"]>
  endpoint={endpoint}
  onUploadBegin={() => {
    if (onUploadBegin) onUploadBegin();
  }}
  onClientUploadComplete={(res) => {
    console.log("Upload completed in component:", res);
    handleComplete(res);
  }}
  onUploadError={(error: Error) => {
    if (onUploadError) onUploadError(error);
  }}
  config={{ mode: "auto" }}
  appearance={{
    label: 'text-gray-700',
    allowedContent: 'text-gray-600',
    button: 'bg-blue-600 text-white hover:bg-blue-700 p-3 cursor-pointer hidden'
  }}
/>
    </div>
  );
};

export const FileUploadButton = ({
  endpoint,
  onUploadComplete,
  className = "",
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const isUploadThingConfigured = true;

const handleComplete = useCallback(
  (res: any[]) => {
    console.log("Upload completed in component:", res);
    if (res?.[0]) {
      const fileUrl = res[0].serverData?.url || res[0].url;
      console.log("Extracted URL:", fileUrl);
      
      if (fileUrl && onUploadComplete) {
        onUploadComplete(fileUrl);
      }
    }
  },
  [onUploadComplete]
);

  if (!isUploadThingConfigured) {
    return (
      <div className={`${className} p-2 border border-dashed rounded-md text-center`}>
        <p className="text-sm text-gray-500">File uploads are disabled</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <UploadButton<OurFileRouter, FileUploadProps["endpoint"]>
        endpoint={endpoint}
        onBeforeUploadBegin={(files) => {
          console.log("Before upload begin:", files);
          return files;
        }}
        onUploadBegin={() => {
          console.log("Upload starting...");
          setIsUploading(true);
        }}
        onClientUploadComplete={(res) => {
          console.log("Upload completed, response:", res);
          handleComplete(res);
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
          setIsUploading(false);
        }}
      />
    </div>
  );
};