// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { Button } from "./ui/button";
// import { Textarea } from "./ui/textarea";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { cn } from "@/lib/utils";
// import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
// import { useChat } from "ai/react";

// const ChatScreen = () => {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]); // To store chat messages
//   const textareaRef = useRef(null);

//   // const { messages, input, handleInputChange, handleSubmit } = useChat();
//   const handleInputChange = (e) => {
//     setMessage(e.target.value);
//     // Adjust the height of the textarea
//     const textarea = textareaRef.current;
//     textarea.style.height = "auto";
//     const newHeight = Math.min(textarea.scrollHeight, 250);
//     textarea.style.height = `${newHeight}px`;
//     textarea.style.overflowY = newHeight >= 250 ? "scroll" : "hidden"; // Enable scrolling if needed
//   };

//   const handleSendMessage = () => {
//     // Add message to chat and clear input
//     if (message.trim()) {
//       setChat([...chat, { message, fromUser: true }]);
//       setMessage("");
//       textareaRef.current.style.height = "auto";
//     }
//   };

//   return (
//     <div className="flex flex-col h-full px-[4rem] pt-[4rem]">
//       {/* Chat Display Area */}

//       <div className="flex-grow overflow-auto mb-4  hide-scrollbar ">
//         {chat.map((chatMsg, index) => (
//           <div
//             key={index}
//             className={`p-2 ${chatMsg.fromUser ? "text-right" : ""}`}
//           >
//             <span className="inline-block bg-gray-200 rounded p-2">
//               {chatMsg.message}
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* Textarea and Icons */}
//       <div className="w-[80%] mx-auto relative">
//         {" "}
//         {/* Container for layout */}
//         {/* Text Area */}
//         <textarea
//           ref={textareaRef}
//           className="w-full p-3 pl-12 pr-12 border rounded resize-none overflow-hidden hide-scrollbar"
//           placeholder="Type your message..."
//           value={message}
//           onChange={handleInputChange}
//           style={{ minHeight: "48px", maxHeight: "250px" }} // Control height of textarea
//         />
//         {/* Clip Icon */}
//         <Button
//           className="absolute left-0 bottom-0 text-gray-500 text-lg p-3"
//           style={{
//             outline: "none",
//             border: "none",
//             backgroundColor: "transparent",
//             zIndex: 2,
//           }} // Additional styling
//         >
//           <FontAwesomeIcon icon={faPaperclip} />
//         </Button>
//         {/* Paper Plane Icon */}
//         <Button
//           onClick={handleSendMessage}
//           className="absolute right-0 bottom-0 text-gray-500 text-lg p-3"
//           style={{
//             outline: "none",
//             border: "none",
//             backgroundColor: "transparent",
//             zIndex: 2,
//           }} // Additional styling
//         >
//           <FontAwesomeIcon icon={faPaperPlane} />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default ChatScreen;

"use client";
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button } from "./ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

interface ChatMessage {
  message: string;
  fromUser: boolean;
}

const ChatScreen: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 250);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = newHeight >= 250 ? "scroll" : "hidden";
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChat([...chat, { message, fromUser: true }]);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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

      {/* Textarea and Icons */}
      <div className="w-[80%] mx-auto relative">
        <textarea
          ref={textareaRef}
          className="w-full p-3 pl-12 pr-12 border-2 rounded resize-none overflow-hidden hide-scrollbar border-black"
          placeholder="Type your message..."
          value={message}
          onChange={handleInputChange}
          style={{ minHeight: "48px", maxHeight: "250px" }}
        />
        <Button
          className="absolute left-3 bottom-3 text-gray-500"
          style={{
            outline: "none",
            border: "none",
            backgroundColor: "transparent",
            zIndex: 2,
          }}
        >
          <FontAwesomeIcon icon={faPaperclip} size="1.5em" />
        </Button>
        <Button
          onClick={handleSendMessage}
          className="absolute right-3 bottom-3 text-gray-500"
          style={{
            outline: "none",
            border: "none",
            backgroundColor: "transparent",
            zIndex: 2,
          }}
        >
          <FontAwesomeIcon icon={faPaperPlane} size="1.5em" />
        </Button>
      </div>
    </div>
  );
};

export default ChatScreen;
