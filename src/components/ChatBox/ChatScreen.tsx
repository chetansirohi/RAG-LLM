//working code
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faFilePdf,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Textarea } from "../ui/textarea";
import FileUpload from "../ChatBox/UploadFile";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";

const ChatScreen = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const chatDisplayRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
  } = useChat();

  const isSubmitEnabled = (input.trim() || pdfFile) && !isLoading;

  useEffect(() => {
    // Auto-scroll to the bottom whenever messages update or isLoading changes
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileSelected = (file: File | null) => {
    setPdfFile(file);
  };

  const removePdfFile = () => {
    setPdfFile(null);
  };

  const customHandleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleInputChange(e); // Call the original handleInputChange from useChat
    adjustTextareaHeight();
  };

  const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitEnabled) {
      originalHandleSubmit(e); // Call the original handleSubmit from useChat
      if (textareaRef.current) {
        textareaRef.current.style.height = "80px"; // Reset textarea height after submission
      }
      setPdfFile(null); // Clear the PDF file after submission
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 250);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isSubmitEnabled) {
      e.preventDefault();
      customHandleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // Casting for compatibility
    }
  };

  return (
    <div className="flex flex-col h-full px-[10%] pt-[4rem]">
      <div
        className="w-[80%] mx-auto flex-grow overflow-auto mb-4 hide-scrollbar"
        ref={chatDisplayRef}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 ${msg.role === "user" ? "text-right" : ""}`}
          >
            <span
              className={`inline-block rounded p-2 ${
                msg.role === "user" ? "bg-blue-400" : "bg-gray-400"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <form
        className="w-[80%] mx-auto relative pb-1"
        onSubmit={customHandleSubmit}
      >
        {pdfFile && (
          <div className="absolute top-3 left-3 flex items-center">
            <FontAwesomeIcon
              icon={faFilePdf}
              size="2x"
              className="text-gray-500 mr-2"
            />
            <span className="text-gray-500 text-sm">{pdfFile.name}</span>
            <FontAwesomeIcon
              icon={faTimes}
              size="1x"
              className="text-gray-500 cursor-pointer ml-2"
              onClick={removePdfFile}
            />
          </div>
        )}
        <Textarea
          ref={textareaRef}
          className={cn(
            "w-full  px-[2rem] py-[1.25rem] border-[-10px] rounded resize-none overflow-hidden hide-scrollbar outline-none "
          )}
          placeholder={
            pdfFile ? "" : "Type your message or upload a file up to 10 mb"
          }
          value={input}
          onKeyDown={handleKeyDown}
          onChange={customHandleInputChange}
          style={{ minHeight: "80px", maxHeight: "250px" }}
          disabled={isLoading} // Disable text area when text is being generated
        />
        <FileUpload onFileSelected={handleFileSelected} />
        <Button
          type="submit"
          className="absolute right-3 bottom-3 text-gray-500"
          disabled={!isSubmitEnabled} // Disable submit button when text is being generated
          style={{
            outline: "none",
            border: "none",
            backgroundColor: "transparent",
            zIndex: 2,
          }}
        >
          <FontAwesomeIcon icon={faPaperPlane} size="1.5em" />
        </Button>
      </form>
    </div>
  );
};

export default ChatScreen;
