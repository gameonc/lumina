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
    return <FileSpreadsheet className="h-8 w-8 text-primary-600" />;
  };

  if (file && !error) {
    return (
      <div
        className={cn(
          "rounded-xl border border-neutral-200 p-6 dark:border-neutral-700",
          className
        )}
      >
        <div className="flex items-center gap-4">
          {getFileIcon()}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-neutral-900 dark:text-white">
              {file.name}
            </p>
            <p className="text-sm text-neutral-500">{formatBytes(file.size)}</p>
          </div>
          {!isUploading && (
            <button
              onClick={removeFile}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Processing...
              </span>
              <span className="font-medium text-primary-600">
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
            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
            : isDragReject
              ? "border-red-500 bg-red-50 dark:bg-red-950/30"
              : "border-neutral-300 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600",
          (disabled || isUploading) && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            isDragReject
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-primary-100 dark:bg-primary-900/30"
          )}
        >
          {isDragReject ? (
            <AlertCircle className="h-8 w-8 text-red-600" />
          ) : (
            <Upload className="h-8 w-8 text-primary-600" />
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
          {isDragActive
            ? isDragReject
              ? "Invalid file type"
              : "Drop your file here"
            : "Drag and drop your file"}
        </h3>

        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          or click to browse from your computer
        </p>

        <p className="mt-4 text-xs text-neutral-500">
          Supports: CSV, XLSX, XLS (max {formatBytes(maxSize)})
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
