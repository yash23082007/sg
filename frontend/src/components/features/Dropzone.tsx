"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import { uploadResume } from "@/lib/api";
import type { ResumeUploadResponse } from "@/types";

interface DropzoneProps {
  onUploadSuccess?: (result: ResumeUploadResponse) => void;
}

export function Dropzone({ onUploadSuccess }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<ResumeUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Strict schema rejection: Only PDF files are supported.");
      return;
    }

    setError(null);
    setUploadedFile(file);
    setIsUploading(true);

    try {
      const response = await uploadResume(file);
      setUploadResult(response);
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume payload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-10 border border-dashed transition-[opacity,transform,border-color] duration-150 cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-950/10 scale-[0.99]"
            : "border-white/10 bg-[#0d0d0d] hover:border-white/20 hover:bg-[#121212]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center space-y-3 pointer-events-none">
          {isUploading ? (
            <div className="p-3 border border-blue-500/30 bg-blue-950/20 text-blue-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : uploadResult ? (
            <div className="p-3 border border-emerald-500/30 bg-emerald-950/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-3 border border-white/10 bg-white/[0.02] text-neutral-400 group-hover:text-white group-hover:border-white/20 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-white">
              {isUploading
                ? "PARSING AST & EXTRACTING TECHNICAL TOKENS..."
                : uploadResult
                ? "INGESTION COMPLETE"
                : "DROP RESUME FILE (PDF) OR CLICK TO BROWSE"}
            </p>
            <p className="font-mono text-xs text-neutral-500 mt-1">
              {uploadedFile
                ? `${uploadedFile.name} • ${(uploadedFile.size / 1024).toFixed(1)} KB`
                : "Directed Acyclic Graph token matching enabled • PDF only"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 border border-rose-500/30 bg-rose-950/20 text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadResult && (
        <div className="p-4 border border-emerald-500/30 bg-emerald-950/10 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {uploadResult.message}
            </span>
            <span className="text-xs font-mono text-neutral-400">
              MATCHED: <strong className="text-white">{uploadResult.matched_count}</strong> NODES
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {uploadResult.extracted_skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 border border-emerald-500/20 bg-emerald-950/30 text-emerald-300 font-mono text-[11px]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
