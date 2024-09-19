"use client";
import React, { useRef, useState, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faSpinner,
  faTimes,
  faUpload,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

interface FileUploadProps {
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
  chatSessionId: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  disabled = false,
  chatSessionId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setFileSelected(false);
      setSelectedFileName("");
      onFileSelected(null);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type === "application/pdf") {
      setFileSelected(true);
      setSelectedFileName(selectedFile.name);
      onFileSelected(selectedFile);
    } else {
      alert("Only PDF files are allowed");
      onFileSelected(null);
      resetFileInput();
    }
  };

  const handleUpload = async () => {
    if (!fileSelected || !chatSessionId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileInputRef.current?.files?.[0] as File);
    formData.append("chatSessionId", chatSessionId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        alert("File uploaded successfully");
        resetFileInput();
        setUploadCompleted(true);
      } else {
        alert("Upload failed: " + data.message);
        resetFileInput();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
      resetFileInput();
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileSelected(false);
    onFileSelected(null);
    resetFileInput(); // Reset file input when file is removed
    setUploadCompleted(false);
  };

  const handleFileUploadClick = () => {
    if (!uploadCompleted && !disabled) {
      // Check if upload is not completed before triggering click
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative flex items-center space-x-2">
      {uploading ? (
        <FontAwesomeIcon icon={faSpinner} spin className="text-lg md:text-xl" />
      ) : fileSelected ? (
        <>
          <FontAwesomeIcon
            icon={faFilePdf}
            className="text-lg md:text-xl text-gray-500 "
          />
          <span className="text-sm truncate max-w-[100px] md:max-w-[150px]">
            {selectedFileName}
          </span>
          <button
            onClick={handleRemoveFile}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} className="text-lg md:text-xl" />
          </button>
          <button
            onClick={handleUpload}
            disabled={!chatSessionId}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faUpload} className="text-lg md:text-xl" />
          </button>
        </>
      ) : (
        <div
          onClick={handleFileUploadClick}
          className={`cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FontAwesomeIcon icon={faPaperclip} className="text-lg md:text-xl" />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="application/pdf"
        disabled={disabled || uploadCompleted}
      />
    </div>
  );
};

export default FileUpload;
