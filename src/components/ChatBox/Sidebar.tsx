"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Chat {
  id: string;
  title: string;
}

const Sidebar = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const response = await fetch(
          `/api/chats/user?userId=${session?.user?.id}`
        );
        if (response.ok) {
          const chatSessions = await response.json();
          setChats(chatSessions);
        } else {
          console.error("Failed to fetch chats");
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    if (session?.user) {
      fetchChatSessions();
    }
  }, [session?.user]);

  useEffect(() => {
    // Scroll to the newly created chat
    if (selectedChatId) {
      const chatElement = document.getElementById(selectedChatId);
      if (chatElement) {
        chatElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [selectedChatId]);

  const createNewChat = useCallback(async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title:
            chats.length === 0
              ? "Conversation 1"
              : `Conversation ${chats.length + 1}`,
          userId: session?.user?.id,
        }),
      });

      if (response.ok) {
        const newChat: Chat = await response.json();
        setChats([newChat, ...chats]);
        setSelectedChatId(newChat.id);
      } else {
        console.error("Failed to create new chat");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  }, [chats, session?.user?.id]);

  useEffect(() => {
    // Check if there are no chats and the user has interacted with the chat area
    if (chats.length === 0 && session?.user) {
      createNewChat();
    }
  }, [chats, session, createNewChat]);

  const handleChatClick = async (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="p-[2rem] pt-[5rem] h-full overflow-y-auto bg-gray-300">
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <button
          className={cn(
            "px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition ease-in-out duration-300"
          )}
          onClick={createNewChat}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          New Chat
        </button>
      </div>

      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`flex justify-between items-center mb-2 p-2 rounded cursor-pointer ${
              chat.id === selectedChatId ? "bg-blue-200" : "bg-gray-100"
            }`}
            onClick={() => handleChatClick(chat.id)}
          >
            <span>{chat.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
