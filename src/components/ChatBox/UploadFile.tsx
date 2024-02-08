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
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected }) => {
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

        if (response.ok) {
          alert("File uploaded successfully");

          setUploadCompleted(true);
        } else {
          const data = await response.json();
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
    <div style={{ position: "relative" }}>
      {uploading ? (
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          style={{ position: "absolute", left: "10px", bottom: "10px" }}
        />
      ) : (
        !fileSelected && (
          <div
            onClick={handleFileUploadClick}
            style={{
              position: "absolute",
              left: "10px",
              bottom: "10px",
              cursor: uploadCompleted ? "default" : "pointer",
              opacity: uploadCompleted ? 0.5 : 1,
            }}
          >
            <FontAwesomeIcon icon={faPaperclip} />
          </div>
        )
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        accept="application/pdf"
        disabled={uploadCompleted}
      />
    </div>
  );
};

export default FileUpload;
