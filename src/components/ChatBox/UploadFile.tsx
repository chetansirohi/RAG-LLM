"use client";
import React, { useRef, useState, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface FileUploadProps {
  user: any; // Replace 'any' with a more specific type if available
  onFileSelected: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ user, onFileSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileSelected, setFileSelected] = useState<boolean>(false);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

        if (response.ok) {
          alert("File uploaded successfully");
        } else {
          const data = await response.json();
          alert(data.message);
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
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ position: "relative" }}>
      {fileSelected && !uploading ? (
        <div
          onClick={handleRemoveFile}
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            cursor: "pointer",
            zIndex: 2,
            color: "gray",
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </div>
      ) : null}

      <div
        onClick={handleFileUploadClick}
        style={{
          position: "absolute",
          left: "10px",
          bottom: "10px",
          cursor: "pointer",
          zIndex: 2,
          color: "gray",
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        {uploading ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={faPaperclip} />
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        accept="application/pdf"
      />
    </div>
  );
};

export default FileUpload;
