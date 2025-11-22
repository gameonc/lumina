"use client";

import { useState, useCallback } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { useDatasetStore } from "@/stores";
import { parseSpreadsheet, isValidSpreadsheetFile } from "@/lib/parsers";
import type { ParsedSpreadsheet } from "@/types";

interface UseFileUploadOptions {
  maxSize?: number; // in bytes
  accept?: Accept;
  onSuccess?: (data: ParsedSpreadsheet, file: File) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const DEFAULT_ACCEPT: Accept = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
};

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    accept = DEFAULT_ACCEPT,
    onSuccess,
    onError,
  } = options;

  const [parsedData, setParsedData] = useState<ParsedSpreadsheet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { setIsUploading, setUploadProgress, setCurrentData } =
    useDatasetStore();

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      if (!uploadedFile) return;

      // Reset state
      setError(null);
      setParsedData(null);
      setFile(uploadedFile);

      // Validate file
      if (!isValidSpreadsheetFile(uploadedFile)) {
        const err = new Error(
          "Invalid file type. Please upload a CSV or Excel file."
        );
        setError(err.message);
        onError?.(err);
        return;
      }

      if (uploadedFile.size > maxSize) {
        const err = new Error(
          `File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`
        );
        setError(err.message);
        onError?.(err);
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(10);

        // Parse the file
        setUploadProgress(30);
        const data = await parseSpreadsheet(uploadedFile);
        setUploadProgress(80);

        // Validate parsed data
        if (data.rowCount === 0) {
          throw new Error("The file is empty or has no valid data.");
        }

        if (data.columnCount === 0) {
          throw new Error("No columns found in the file.");
        }

        setUploadProgress(100);
        setParsedData(data);
        setCurrentData(data);
        onSuccess?.(data, uploadedFile);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to parse file");
        setError(error.message);
        onError?.(error);
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 500);
      }
    },
    [
      maxSize,
      onSuccess,
      onError,
      setIsUploading,
      setUploadProgress,
      setCurrentData,
    ]
  );

  const dropzone = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const reset = useCallback(() => {
    setParsedData(null);
    setError(null);
    setFile(null);
    setCurrentData(null);
  }, [setCurrentData]);

  return {
    ...dropzone,
    parsedData,
    error,
    file,
    reset,
  };
}
