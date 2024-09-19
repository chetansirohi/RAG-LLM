"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faFilePdf,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Textarea } from "../ui/textarea";
import FileUpload from "../ChatBox/UploadFile";
import { cn, adjustTextareaHeight } from "@/lib/frontendUtils";
import { useChat } from "ai/react";

const ChatScreen = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isOnChatPage = pathname === "/chat";
  const router = useRouter();
  const selectedChatId = searchParams.get("chatId");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatDisplayRef = useRef<HTMLDivElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadDisabled, setUploadDisabled] = useState<boolean>(false);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    id: selectedChatId || undefined,
    initialMessages: [],
    api: "/api/chat",
  });

  const isSubmitEnabled = input.trim() && !isLoading;

  useEffect(() => {
    // Auto-scroll to the bottom whenever messages update or isLoading changes
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (selectedChatId) {
        try {
          const response = await fetch(`/api/chats/${selectedChatId}`);
          if (response.ok) {
            const chatSession = await response.json();
            const chatMessages = chatSession.messages.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
            }));
            setMessages(chatMessages);
            setUploadDisabled(
              chatSession.messages.some((msg: any) => msg.file !== null)
            );
          } else {
            console.error("Failed to fetch chat session");
          }
        } catch (error) {
          console.error("Error fetching chat session:", error);
        }
      }
    };

    fetchChatMessages();
  }, [selectedChatId, setMessages]);

  const customHandleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleInputChange(e); // Call the original handleInputChange from useChat
    adjustTextareaHeight(textareaRef.current);
  };

  const createNewChat = useCallback(async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Conversation",
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        router.push(`/chat?chatId=${newChat.id}`);
        return newChat.id;
      } else {
        console.error("Failed to create new chat");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  }, [router]);

  const customHandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (input.trim()) {
      let currentChatId = selectedChatId;

      if (!currentChatId) {
        currentChatId = await createNewChat();
      }

      if (currentChatId) {
        let options = { headers: { "x-chat-id": currentChatId } };
        await originalHandleSubmit(e, { options });

        const response = await fetch(`/api/chats/${currentChatId}`);
        if (response.ok) {
          const chatSession = await response.json();
          const chatMessages = chatSession.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
          }));
        }
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = "80px";
      }

      // Trigger a refresh of the sidebar
      window.dispatchEvent(new CustomEvent("refreshSidebar"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isSubmitEnabled) {
      e.preventDefault();
      customHandleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // Casting for compatibility
    }
  };

  return (
    <div className="flex flex-col h-full px-4 md:px-[10%] pt-16 md:pt-[5rem] pb-4 md:pb-[2.5rem]">
      <div
        className="w-full md:w-[80%] mx-auto flex-grow overflow-auto mb-4 hide-scrollbar"
        ref={chatDisplayRef}
      >
        {messages.map((msg, index) => {
          const alignmentClassName =
            msg.role === "user" ? "text-right" : "text-left";
          const colorClassName =
            msg.role === "user" ? "bg-blue-400" : "bg-gray-400";

          return (
            <div key={index} className={`p-2 ${alignmentClassName}`}>
              <div
                className={`inline-block rounded p-2 ${colorClassName} text-sm md:text-base`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="w-full md:w-[80%] mx-auto relative pb-1"
        onSubmit={customHandleSubmit}
      >
        <div className="relative">
          <Textarea
            ref={textareaRef}
            className={cn(
              "w-full px-3 pl-12 pr-12  md:pl-16 md:pr-16  py-2 md:py-[1.25rem] border-[-10px] rounded resize-none overflow-y-auto hide-scrollbar outline-none text-sm md:text-base"
            )}
            placeholder={
              pdfFile ? "" : "Type your message or upload a file up to 10 mb"
            }
            value={input}
            onKeyDown={handleKeyDown}
            onChange={customHandleInputChange}
            style={{ minHeight: "60px", maxHeight: "200px" }}
            disabled={isLoading}
          />
          <div className="absolute left-2 md:left-4  top-1/2 -translate-y-1/2 flex items-center">
            <FileUpload
              onFileSelected={(file) => setPdfFile(file)}
              disabled={uploadDisabled || (isOnChatPage && !selectedChatId)}
              chatSessionId={selectedChatId}
            />
          </div>
          <Button
            type="submit"
            className="absolute right-2 md:right-4   top-1/2 -translate-y-1/2 text-gray-500"
            disabled={!isSubmitEnabled}
            style={{
              outline: "none",
              border: "none",
              backgroundColor: "transparent",
              zIndex: 2,
            }}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-xl" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatScreen;
