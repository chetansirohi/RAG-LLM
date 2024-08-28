"use client";
import React, { useRef, useState, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface FileUploadProps {
  onFileSelected: (file: File | null) => void;

  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,

  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(false);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setFileSelected(false);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type === "application/pdf") {
      setFileSelected(true);
      onFileSelected(selectedFile);
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (response.ok) {
          alert("File uploaded successfully");
          setUploadCompleted(true);
        } else {
          alert("Upload failed: " + data.message);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file");
      } finally {
        setUploading(false);
        setFileSelected(false);
        resetFileInput(); // Reset input field after upload or error
      }
    } else {
      alert("Only PDF files are allowed");
      onFileSelected(null);
      resetFileInput(); // Reset input field if not a PDF
    }
  };

  const handleRemoveFile = () => {
    setFileSelected(false);
    onFileSelected(null);
    resetFileInput(); // Reset file input when file is removed
    setUploadCompleted(false);
  };

  const handleFileUploadClick = () => {
    if (!uploadCompleted) {
      // Check if upload is not completed before triggering click
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative">
      {uploading ? (
        <FontAwesomeIcon icon={faSpinner} spin className="text-lg md:text-xl" />
      ) : (
        !fileSelected && (
          <div
            onClick={handleFileUploadClick}
            className={`cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-colors ${
              uploadCompleted ? "opacity-50 cursor-default" : ""
            }`}
          >
            <FontAwesomeIcon
              icon={faPaperclip}
              className="text-lg md:text-xl"
            />
          </div>
        )
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
