"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/dropdown-menu"; // Replace with your dropdown menu component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  const [chats, setChats] = useState([]); // Replace with your chat data

  const handleNewChat = () => {
    // Logic to handle new chat creation
  };

  const handleRenameChat = (chatId) => {
    // Logic to rename a chat
  };

  const handleShareChat = (chatId) => {
    // Logic to share a chat
  };

  const handleDeleteChat = (chatId) => {
    // Logic to delete a chat
  };

  return (
    <div className="p-[2rem] h-full overflow-y-auto bg-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Chats</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleNewChat}
        >
          + New Chat
        </button>
      </div>

      <ul>
        {chats.map((chat, index) => (
          <li
            key={index}
            className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded"
          >
            <span>{chat.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleRenameChat(chat.id)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareChat(chat.id)}>
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteChat(chat.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
