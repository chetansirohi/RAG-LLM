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

//  Secondary code

// "use client";
// import React, { useState, useRef, useEffect, ChangeEvent } from "react";
// import { Button } from "../ui/button";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPaperclip,
//   faPaperPlane,
//   faFilePdf,
// } from "@fortawesome/free-solid-svg-icons";
// import { Textarea } from "../ui/textarea";
// import FileUpload from "../ChatBox/UploadFile";
// import { cn } from "@/lib/utils";

// interface ChatMessage {
//   message: string;
//   fromUser: boolean;
// }

// export default function ChatScreen({ user }) {
//   const [message, setMessage] = useState<string>("");
//   const [chat, setChat] = useState<ChatMessage[]>([]);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const [isFileSelected, setIsFileSelected] = useState<boolean>(false);

//   const handleFileSelected = (selected: boolean) => {
//     setIsFileSelected(selected);
//   };

//   const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
//     setMessage(e.target.value);
//     const textarea = textareaRef.current;
//     if (textarea) {
//       textarea.style.height = "auto";
//       const newHeight = Math.min(textarea.scrollHeight, 250);
//       textarea.style.height = `${newHeight}px`;
//       textarea.style.overflowY = newHeight >= 250 ? "scroll" : "hidden";
//     }
//   };

//   const handleSendMessage = () => {
//     if (message.trim()) {
//       setChat([...chat, { message, fromUser: true }]);
//       setMessage("");
//       if (textareaRef.current) {
//         textareaRef.current.style.height = "auto";
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col h-full px-[10%] pt-[4rem]">
//       {/* Chat Display Area */}
//       <div className="w-[80%] mx-auto flex-grow overflow-auto mb-4 hide-scrollbar">
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
//       <div className="w-[80%] mx-auto relative pb-1">
//         <Textarea
//           ref={textareaRef}
//           className={cn(
//             "w-full p-3 pl-12 pr-12 border-2 rounded resize-none overflow-hidden hide-scrollbar outline-none"
//           )}
//           placeholder="Type your message..."
//           value={message}
//           onChange={handleInputChange}
//           style={{
//             minHeight: "48px",
//             maxHeight: "250px",
//           }}
//         />

//         {/* <Button
//           className="absolute left-3 bottom-3 text-gray-500"
//           style={{
//             outline: "none",
//             border: "none",
//             backgroundColor: "transparent",
//             zIndex: 2,
//           }}
//         >
//           <FontAwesomeIcon icon={faPaperclip} className="text-sm" />
//         </Button> */}
//         {isFileSelected && (
//           <FontAwesomeIcon
//             icon={faFilePdf}
//             size="2x"
//             className="absolute bottom-5 left-5"
//           />
//         )}
//         <FileUpload user={user} onFileSelected={handleFileSelected} />
//         <Button
//           onClick={handleSendMessage}
//           className="absolute right-3 bottom-3 text-gray-500"
//           style={{
//             outline: "none",
//             border: "none",
//             backgroundColor: "transparent",
//             zIndex: 2,
//           }}
//         >
//           <FontAwesomeIcon icon={faPaperPlane} size="1.5em" />
//         </Button>
//       </div>
//     </div>
//   );
// }

//Almost correct

// "use client";
// import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
// import { Button } from "../ui/button";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPaperclip,
//   faPaperPlane,
//   faFilePdf,
// } from "@fortawesome/free-solid-svg-icons";
// import { Textarea } from "../ui/textarea";
// import FileUpload from "../ChatBox/UploadFile";
// import { cn } from "@/lib/utils";

// interface ChatMessage {
//   message: string;
//   fromUser: boolean;
// }

// const ChatScreen = ({ user }) => {
//   const [message, setMessage] = useState<string>("");
//   const [chat, setChat] = useState<ChatMessage[]>([]);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const [isFileSelected, setIsFileSelected] = useState<boolean>(false);

//   const handleFileSelected = (selected: boolean) => {
//     setIsFileSelected(selected);
//   };

//   const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
//     setMessage(e.target.value);
//     const textarea = textareaRef.current;
//     if (textarea) {
//       textarea.style.height = "auto";
//       const newHeight = Math.min(textarea.scrollHeight, 250);
//       textarea.style.height = `${newHeight}px`;
//       textarea.style.overflowY = newHeight >= 250 ? "scroll" : "hidden";
//     }
//   };

//   const handleSendMessage = () => {
//     if (message.trim()) {
//       setChat([...chat, { message, fromUser: true }]);
//       setMessage("");
//       if (textareaRef.current) {
//         textareaRef.current.style.height = "auto";
//       }
//     }
//     // Here, you can also handle file upload if needed
//   };

//   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault(); // Prevent default to avoid newline in textarea
//       handleSendMessage();
//     }
//   };

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     handleSendMessage();
//   };

//   return (
//     <div className="flex flex-col h-full px-[10%] pt-[4rem]">
//       {/* Chat Display Area */}
//       <div className="w-[80%] mx-auto flex-grow overflow-auto mb-4 hide-scrollbar">
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

//       {/* Textarea and Icons inside Form */}
//       <form className="w-[80%] mx-auto relative pb-1" onSubmit={handleSubmit}>
//         <Textarea
//           ref={textareaRef}
//           className={cn(
//             "w-full p-3 pl-12 pr-12 border-2 rounded resize-none overflow-hidden hide-scrollbar outline-none"
//           )}
//           placeholder="Type your message..."
//           value={message}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           style={{ minHeight: "48px", maxHeight: "250px" }}
//         />

//         {isFileSelected && (
//           <FontAwesomeIcon
//             icon={faFilePdf}
//             size="2x"
//             className="absolute bottom-5 left-14"
//           />
//         )}
//         <FileUpload user={user} onFileSelected={handleFileSelected} />

//         <Button
//           type="submit"
//           className="absolute right-3 bottom-3 text-gray-500"
//           style={{
//             outline: "none",
//             border: "none",
//             backgroundColor: "transparent",
//             zIndex: 2,
//           }}
//         >
//           <FontAwesomeIcon icon={faPaperPlane} size="1.5em" />
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default ChatScreen;

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

  const handleFileSelected = (file: File | null) => {
    setPdfFile(file);
  };

  const removePdfFile = () => {
    setPdfFile(null);
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const handleSendMessage = () => {
    if (message.trim() || pdfFile) {
      setChat([
        ...chat,
        { message: message || "PDF file sent", fromUser: true },
      ]);
      setMessage("");
      setPdfFile(null);
      adjustTextareaHeight(textareaRef.current);
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
