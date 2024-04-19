// "use client";
// import React, { useState } from "react";
// import {
//   DropdownMenu,
//   DropdownMenuItem,
//   DropdownMenuSubTrigger,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
// } from "../ui/dropdown-menu"; // Replace with your dropdown menu component
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit } from "@fortawesome/free-solid-svg-icons";
// import { cn } from "@/lib/utils";

// const Sidebar = () => {
//   const [chats, setChats] = useState([]); // Replace with your chat data

//   return (
//     <div className="p-[2rem] pt-[5rem] h-full overflow-y-auto bg-gray-300">
//       <div className="flex flex-col items-center mb-4">
//         <h2 className="text-xl font-bold mb-4">Chats</h2>
//         <button
//           className={cn(
//             "px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition ease-in-out duration-300"
//           )}
//         >
//           + New Chat
//         </button>
//       </div>

//       <ul>
//         {chats.map((chat, index) => (
//           <li
//             key={index}
//             className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded"
//           >
//             <span>{chat.name}</span>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <button>
//                   <FontAwesomeIcon icon={faEdit} />
//                 </button>
//               </DropdownMenuTrigger>
//             </DropdownMenu>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

"use client";
import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const Sidebar = () => {
  const [chats, setChats] = useState([]);
  const [nextChatId, setNextChatId] = useState(1);
  const { data: session } = useSession();

  useEffect(() => {
    // Fetch chats from the API when the component mounts
    fetchChats();
  }, []);

  const fetchChats = async () => {
    if (session?.user) {
      const response = await fetch("/api/chats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.ok) {
        const chats = await response.json();
        setChats(chats);
        setNextChatId(chats.length + 1);
      } else {
        console.error("Failed to fetch chats");
      }
    }
  };

  const handleNewChat = async () => {
    if (session?.user) {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          title: `Conversation ${nextChatId}`,
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats([newChat, ...chats]);
        setNextChatId(nextChatId + 1);
      } else {
        console.error("Failed to create new chat");
      }
    }
  };

  const handleRenameChat = async (chatId, newTitle) => {
    if (session?.user) {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        const updatedChat = await response.json();
        setChats(
          chats.map((chat) => (chat.id === chatId ? updatedChat : chat))
        );
      } else {
        console.error("Failed to rename chat");
      }
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (session?.user) {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.ok) {
        setChats(chats.filter((chat) => chat.id !== chatId));
      } else {
        console.error("Failed to delete chat");
      }
    }
  };

  return (
    <div className="p-[2rem] pt-[5rem] h-full overflow-y-auto bg-gray-300">
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <button
          className={cn(
            "px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition ease-in-out duration-300"
          )}
          onClick={handleNewChat}
        >
          + New Chat
        </button>
      </div>

      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded"
          >
            <span>{chat.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => {
                    const newTitle = prompt("Enter new chat title:");
                    if (newTitle) {
                      handleRenameChat(chat.id, newTitle);
                    }
                  }}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleDeleteChat(chat.id)}>
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
