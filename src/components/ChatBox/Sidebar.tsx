"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { cn, fetchChatSessions, createNewChat } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

interface Chat {
  id: string;
  title: string;
}

const Sidebar = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    window.addEventListener("toggleSidebar", toggleSidebar);
    return () => {
      window.removeEventListener("toggleSidebar", toggleSidebar);
    };
  }, [toggleSidebar]);

  const refreshChatSessions = useCallback(async () => {
    if (session?.user) {
      const chatSessions = await fetchChatSessions();
      setChats(chatSessions);
    }
  }, [session?.user]);

  useEffect(() => {
    refreshChatSessions();
    const intervalId = setInterval(refreshChatSessions, 60000);
    return () => clearInterval(intervalId);
  }, [refreshChatSessions]);

  const handleNewChat = useCallback(async () => {
    const newChat = await createNewChat(chats.length);
    if (newChat) {
      setChats([newChat, ...chats]);
      setSelectedChatId(newChat.id);
      router.push(`/chat?chatId=${newChat.id}`);
      setIsSidebarOpen(false);
    }
  }, [chats, router]);

  const handleChatClick = async (chatId: string) => {
    setSelectedChatId(chatId);
    router.push(`/chat?chatId=${chatId}`);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-full md:w-64 bg-gray-300 overflow-y-auto transition-transform duration-300 ease-in-out transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0"
        )}
      >
        <div className="p-4 pt-20 md:pt-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Chats</h2>
            <Button
              className="md:hidden "
              onClick={() => {
                setIsSidebarOpen(false);
                signOut({ callbackUrl: "/" });
              }}
            >
              Sign Out
            </Button>
          </div>
          <Button className="w-full mb-4" onClick={handleNewChat}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Chat
          </Button>

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
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
