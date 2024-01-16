"use client";
import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
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

interface ChatMessage {
  message: string;
  fromUser: boolean;
}

const ChatScreen = ({ user }) => {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSendButtonEnabled, setIsSendButtonEnabled] =
    useState<boolean>(false);

  const handleFileSelected = (file: File | null) => {
    setPdfFile(file);
    setIsSendButtonEnabled(file !== null || message.trim() !== "");
  };

  const removePdfFile = () => {
    setPdfFile(null);
    setIsSendButtonEnabled(message.trim() !== "");
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    setIsSendButtonEnabled(newMessage.trim() !== "" || pdfFile !== null);
    adjustTextareaHeight(e.target);
  };

  const handleSendMessage = () => {
    if (isSendButtonEnabled) {
      setChat([
        ...chat,
        { message: message || "PDF file sent", fromUser: true },
      ]);
      setMessage("");
      setPdfFile(null);
      adjustTextareaHeight(textareaRef.current);
      setIsSendButtonEnabled(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = "48px";
      }
    }
  };

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 250);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = newHeight >= 250 ? "scroll" : "hidden";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid newline in textarea
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full px-[10%] pt-[4rem]">
      {/* Chat Display Area */}
      <div className="w-[80%] mx-auto flex-grow overflow-auto mb-4 hide-scrollbar">
        {chat.map((chatMsg, index) => (
          <div
            key={index}
            className={`p-2 ${chatMsg.fromUser ? "text-right" : ""}`}
          >
            <span className="inline-block bg-gray-200 rounded p-2">
              {chatMsg.message}
            </span>
          </div>
        ))}
      </div>

      {/* Textarea and Icons inside Form */}
      <form className="w-[80%] mx-auto relative pb-1" onSubmit={handleSubmit}>
        <Textarea
          ref={textareaRef}
          className={cn(
            "w-full p-3 pl-12 pr-12 border-2 rounded resize-none overflow-hidden hide-scrollbar outline-none"
          )}
          placeholder={pdfFile ? "" : "Type your message..."}
          value={message}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          style={{ minHeight: "48px", maxHeight: "250px" }}
        />

        {pdfFile && (
          <div className="absolute bottom-5 left-14 flex items-center">
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
        <FileUpload user={user} onFileSelected={handleFileSelected} />

        <Button
          type="submit"
          className="absolute right-3 bottom-3 text-gray-500"
          disabled={!isSendButtonEnabled}
          style={{
            outline: "none",
            border: "none",
            backgroundColor: "transparent",
            zIndex: 2,
            opacity: isSendButtonEnabled ? 1 : 0.5,
            cursor: isSendButtonEnabled ? "pointer" : "default",
          }}
        >
          <FontAwesomeIcon icon={faPaperPlane} size="1.5em" />
        </Button>
      </form>
    </div>
  );
};

export default ChatScreen;
