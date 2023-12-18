"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]); // To store chat messages
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    // Adjust the height of the textarea
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 250); // Max height 175px
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = newHeight >= 250 ? "scroll" : "hidden"; // Enable scrolling if needed
  };

  const handleSendMessage = () => {
    // Add message to chat and clear input
    if (message.trim()) {
      setChat([...chat, { message, fromUser: true }]);
      setMessage("");
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="flex flex-col h-full px-[4rem] pt-[4rem]">
      {/* Chat Display Area */}
      <div className="flex-grow overflow-auto mb-4">
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

      {/* Textarea and Icons */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full p-3 pl-10 pr-10 border rounded resize-none overflow-hidden hide-scrollbar "
          placeholder="Type your message..."
          value={message}
          onChange={handleInputChange}
          style={{ minHeight: "48px" }} // Initial height of textarea
        />

        {/* Icons */}
        <FontAwesomeIcon
          icon={faPaperclip}
          className={`absolute left-3 ${
            message ? "bottom-3" : "top-3"
          } text-gray-500 text-lg`}
        />
        <Button
          onClick={handleSendMessage}
          className={`absolute right-3 ${
            message ? "bottom-3" : "top-3"
          } text-gray-500 text-lg`}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </Button>
      </div>
    </div>
  );
};

export default ChatScreen;
