/**
 * @file UploadResume.tsx
 * @description Smart feature component wrapping the Dropzone with candidate target spec configuration.
 */

"use client";

import { useState } from "react";
import { Dropzone } from "@/components/features/Dropzone";
import type { ResumeUploadResponse } from "@/types";
import { FileCode } from "lucide-react";

interface UploadResumeProps {
  onSuccess?: (res: ResumeUploadResponse) => void;
}

export function UploadResume({ onSuccess }: UploadResumeProps) {
  const [result, setResult] = useState<ResumeUploadResponse | null>(null);

  const handleUploadSuccess = (res: ResumeUploadResponse) => {
    setResult(res);
    if (onSuccess) onSuccess(res);
  };

  return (
    <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileCode className="w-4 h-4 text-blue-400" />
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
          BINARY PDF / DOCX INGESTION ZONE
        </h2>
      </div>

      <Dropzone onUploadSuccess={handleUploadSuccess} />
    </div>
  );
}
