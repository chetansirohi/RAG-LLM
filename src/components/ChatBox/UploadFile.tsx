// "use client";
// import React, { useRef, useState, ChangeEvent } from "react";
// import { Button } from "../ui/button";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

// const FileUpload: React.FC = () => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);

//   const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.type !== "application/pdf") {
//         alert("Only PDF files are allowed"); // Replace with a more user-friendly notification
//         return;
//       }

//       setUploading(true);
//       const formData = new FormData();
//       formData.append("file", file);

//       try {
//         const response = await fetch("/api/upload", {
//           method: "POST",
//           body: formData,
//         });

//         if (response.ok) {
//           alert("File uploaded successfully"); // Replace with a more user-friendly notification
//         } else {
//           const data = await response.json();
//           alert(data.message); // Replace with a more user-friendly notification
//         }
//       } catch (error) {
//         console.error("Error uploading file:", error);
//         alert("Error uploading file"); // Replace with a more user-friendly notification
//       } finally {
//         setUploading(false);
//       }
//     }
//   };

//   const handleFileUploadClick = () => {
//     fileInputRef.current?.click();
//   };

//   return (
//     <div>
//       <Button
//         onClick={handleFileUploadClick}
//         className="absolute left-3 bottom-3 text-gray-500"
//         style={{
//           outline: "none",
//           border: "none",
//           backgroundColor: "transparent",
//           zIndex: 2,
//         }}
//       >
//         <FontAwesomeIcon icon={faPaperclip} />
//         {uploading && " Uploading..."}
//       </Button>
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileInputChange}
//         style={{ display: "none" }}
//         accept=".pdf"
//       />
//     </div>
//   );
// };

// export default FileUpload;

"use client";
import React, { useRef, useState, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface FileUploadProps {
  user: any;
  onFileSelected: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ user, onFileSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileSelected, setFileSelected] = useState<boolean>(false);

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
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
      }
    } else {
      alert("Only PDF files are allowed");
      onFileSelected(null);
    }
  };

  const handleRemoveFile = () => {
    setFileSelected(false);
    onFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
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
