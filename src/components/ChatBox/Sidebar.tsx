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

// export default Sidebar;

// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   DropdownMenu,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
// } from "../ui/dropdown-menu";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
// import { cn } from "@/lib/utils";

// const Sidebar = () => {
//   const [chats, setChats] = useState(() => {
//     // Load chats from localStorage or initialize with Conversation 1 if empty
//     const savedChats = localStorage.getItem("chats");
//     if (savedChats) {
//       return JSON.parse(savedChats);
//     } else {
//       return [{ id: 1, name: "Conversation 1" }];
//     }
//   });
//   const [nextChatId, setNextChatId] = useState(() => {
//     // Initialize nextChatId based on saved chats or start with 2
//     const savedChats = localStorage.getItem("chats");
//     if (savedChats) {
//       const chats = JSON.parse(savedChats);
//       return chats.reduce((maxId, chat) => Math.max(maxId, chat.id), 0) + 1;
//     } else {
//       return 2;
//     }
//   });

//   // Update localStorage whenever chats change
//   useEffect(() => {
//     localStorage.setItem("chats", JSON.stringify(chats));
//   }, [chats]);

//   const handleNewChat = () => {
//     const newChat = { id: nextChatId, name: `Conversation ${nextChatId}` };
//     setChats((prevChats) => [newChat, ...prevChats]);
//     setNextChatId((prevId) => prevId + 1);
//   };

//   const handleRenameChat = (chatId) => {
//     const newName = prompt("Enter new chat name:");
//     if (!newName || newName.trim() === "") {
//       alert("Chat name cannot be empty.");
//       return;
//     }
//     setChats((chats) =>
//       chats.map((chat) =>
//         chat.id === chatId ? { ...chat, name: newName } : chat
//       )
//     );
//   };

//   const handleDeleteChat = (chatId) => {
//     setChats((chats) => chats.filter((chat) => chat.id !== chatId));
//   };

//   return (
//     <div className="p-[2rem] pt-[5rem] h-full overflow-y-auto bg-gray-300">
//       <div className="flex flex-col items-center mb-4">
//         <h2 className="text-xl font-bold mb-4">Chats</h2>
//         <button
//           className={cn(
//             "px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition ease-in-out duration-300"
//           )}
//           onClick={handleNewChat}
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
//                   <FontAwesomeIcon icon={faEllipsisV} />
//                 </button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuItem onClick={() => handleRenameChat(chat.id)}>
//                   Rename
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => handleDeleteChat(chat.id)}>
//                   Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;

// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import {
//   DropdownMenu,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
// } from "../ui/dropdown-menu";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faEllipsisV,
//   faCheck,
//   faTimes,
// } from "@fortawesome/free-solid-svg-icons"; // Make sure to import the correct icons
// import { cn } from "@/lib/utils";

// const Sidebar = () => {
//   const [chats, setChats] = useState(() => {
//     const savedChats = localStorage.getItem("chats");
//     return savedChats
//       ? JSON.parse(savedChats)
//       : [{ id: 1, name: "Conversation 1" }];
//   });
//   const [nextChatId, setNextChatId] = useState(2);
//   const [editingId, setEditingId] = useState(null);
//   const [draftName, setDraftName] = useState("");
//   const editingInputRef = useRef(null);

//   useEffect(() => {
//     if (editingId != null && editingInputRef.current) {
//       editingInputRef.current.focus();
//     }
//   }, [editingId]);

//   const handleRenameChat = (chatId) => {
//     if (!draftName.trim()) {
//       setDraftName(chats.find((chat) => chat.id === editingId).name);
//     } else {
//       setChats(
//         chats.map((chat) =>
//           chat.id === chatId ? { ...chat, name: draftName } : chat
//         )
//       );
//     }
//     setEditingId(null);
//   };

//   return (
//     <div className="p-[2rem] pt-[5rem] h-full overflow-y-auto bg-gray-300">
//       <div className="flex flex-col items-center mb-4">
//         <h2 className="text-xl font-bold mb-4">Chats</h2>
//         <button
//           className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition ease-in-out duration-300"
//           onClick={() => {
//             const newChatId = nextChatId;
//             setChats([
//               { id: newChatId, name: `Conversation ${newChatId}` },
//               ...chats,
//             ]);
//             setNextChatId(newChatId + 1);
//           }}
//         >
//           + New Chat
//         </button>
//       </div>

//       <ul>
//         {chats.map((chat) => (
//           <li
//             key={chat.id}
//             className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded"
//           >
//             {editingId === chat.id ? (
//               <input
//                 ref={editingInputRef}
//                 className="flex-1"
//                 value={draftName}
//                 onChange={(e) => setDraftName(e.target.value)}
//                 onBlur={() => handleRenameChat(chat.id)}
//                 onKeyDown={(e) =>
//                   e.key === "Enter" && handleRenameChat(chat.id)
//                 }
//               />
//             ) : (
//               <span>{chat.name}</span>
//             )}
//             <div>
//               {editingId === chat.id ? (
//                 <>
//                   <button onClick={() => handleRenameChat(chat.id)}>
//                     <FontAwesomeIcon icon={faCheck} />
//                   </button>
//                   <button onClick={() => setEditingId(null)}>
//                     <FontAwesomeIcon icon={faTimes} />
//                   </button>
//                 </>
//               ) : (
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <button>
//                       <FontAwesomeIcon icon={faEllipsisV} />
//                     </button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent>
//                     <DropdownMenuItem
//                       onClick={() => {
//                         setEditingId(chat.id);
//                         setDraftName(chat.name);
//                       }}
//                     >
//                       Rename
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() =>
//                         setChats(chats.filter((c) => c.id !== chat.id))
//                       }
//                     >
//                       Delete
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;

"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu"; // Adjust as per your component structure

const Sidebar = () => {
  const [chats, setChats] = useState([]);
  const [chatCount, setChatCount] = useState(0); // To keep track of total chats ever created

  const handleNewChat = () => {
    const newChat = {
      id: chatCount + 1, // Use unique ID for key purposes and reference
      name: `Conversation ${chatCount + 1}`,
    };
    setChats([newChat, ...chats]); // Prepend new chats to the array to show at the top
    setChatCount(chatCount + 1); // Update the chat count
  };

  const handleRenameChat = (id, newName) => {
    // Implement rename logic
  };

  const handleDeleteChat = (id) => {
    // Implement delete logic
  };

  return (
    <div className="p-[2rem] pt-[5rem] h-full overflow-y-auto bg-gray-300">
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <button
          onClick={handleNewChat}
          className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition ease-in-out duration-300"
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
            <span>{chat.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleRenameChat(chat.id)}>
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
