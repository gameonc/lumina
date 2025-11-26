"use client";

import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { cn } from "@/utils/cn";
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Progress } from "@/components/ui";

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  onFileRejected?: (error: string) => void;
  maxSize?: number;
  accept?: Accept;
  className?: string;
  disabled?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}

const DEFAULT_ACCEPT: Accept = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
};

export function FileDropzone({
  onFileAccepted,
  onFileRejected,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = DEFAULT_ACCEPT,
  className,
  disabled = false,
  isUploading = false,
  uploadProgress = 0,
}: FileDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const errorMessage =
          "Invalid file. Please upload a CSV or Excel file under 50MB.";
        setError(errorMessage);
        onFileRejected?.(errorMessage);
        return;
      }

      const uploadedFile = acceptedFiles[0];
      if (uploadedFile) {
        setFile(uploadedFile);
        onFileAccepted(uploadedFile);
      }
    },
    [onFileAccepted, onFileRejected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
      disabled: disabled || isUploading,
    });

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const getFileIcon = () => {
    return <FileSpreadsheet className="h-8 w-8 text-violet-600" />;
  };

  if (file && !error) {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
          className
        )}
      >
        <div className="flex items-center gap-4">
          {getFileIcon()}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">
              {file.name}
            </p>
            <p className="text-sm text-slate-500">{formatBytes(file.size)}</p>
          </div>
          {!isUploading && (
            <button
              onClick={removeFile}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Processing...
              </span>
              <span className="font-semibold text-violet-600">
                {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="mt-2" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all",
          isDragActive && !isDragReject
            ? "border-violet-500 bg-violet-50"
            : isDragReject
              ? "border-red-500 bg-red-50"
              : "border-slate-200 bg-slate-50/50 hover:border-violet-400 hover:bg-violet-50/50",
          (disabled || isUploading) && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            isDragReject
              ? "bg-red-100"
              : "bg-violet-100"
          )}
        >
          {isDragReject ? (
            <AlertCircle className="h-8 w-8 text-red-600" />
          ) : (
            <Upload className="h-8 w-8 text-violet-600" />
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          {isDragActive
            ? isDragReject
              ? "Invalid file type"
              : "Drop your file here"
            : "Drag and drop your file"}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          or click to browse from your computer
        </p>

        <p className="mt-4 text-xs text-slate-400">
          Supports: CSV, XLSX, XLS (max {formatBytes(maxSize)})
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-red-50 border border-red-100 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
