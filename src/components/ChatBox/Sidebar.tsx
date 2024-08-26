"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Chat {
  id: string;
  title: string;
}

const Sidebar = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const fetchChatSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/chats`);
      if (response.ok) {
        const chatSessions = await response.json();
        setChats(chatSessions);
        console.log("Fetched chat sessions:", chatSessions);
      } else {
        console.error("Failed to fetch chats");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchChatSessions();
      const intervalId = setInterval(fetchChatSessions, 60000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [session?.user, fetchChatSessions]);

  const createNewChat = useCallback(async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Conversation ${chats.length + 1}`,
        }),
      });

      if (response.ok) {
        const newChat: Chat = await response.json();
        setChats([newChat, ...chats]);
        setSelectedChatId(newChat.id);
        router.push(`/chat?chatId=${newChat.id}`);
      } else {
        console.error("Failed to create new chat");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  }, [chats, router]);

  const handleChatClick = async (chatId: string) => {
    setSelectedChatId(chatId);
    router.push(`/chat?chatId=${chatId}`);
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
