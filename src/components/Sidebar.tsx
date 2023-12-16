"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlus,
  faEdit,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Hamburger Menu for Small Screens */}
      <div className="md:hidden flex items-center justify-between bg-gray-800 p-4">
        <button className="text-white" onClick={handleSidebarToggle}>
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        <div className="text-white text-xl">Chatty</div>
        {/* Add user photo here */}
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-90" : "hidden"
        } md:w-1/3 lg:w-1/4 xl:w-1/5 bg-gray-200 h-screen overflow-y-auto md:flex md:flex-col`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Chats</h2>
            <button className="bg-blue-500 text-white py-2 px-4 rounded">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              New Chat
            </button>
          </div>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search for your chats"
              className="border rounded p-2 pr-10 w-full"
            />
            <button className="absolute top-0 right-0 bg-blue-500 text-white py-2 px-4 rounded">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          <div className="mt-4">
            <div
              className={`flex justify-between items-center py-2 border-b cursor-pointer ${
                isEditing ? "bg-gray-100" : ""
              }`}
              onClick={handleEditClick}
            >
              <span>Chat Title 1</span>
              <FontAwesomeIcon
                icon={faEdit}
                className="text-gray-500 text-sm"
              />
            </div>
            <div
              className={`flex justify-between items-center py-2 border-b cursor-pointer ${
                isEditing ? "bg-gray-100" : ""
              }`}
              onClick={handleEditClick}
            >
              <span>Chat Title 2</span>
              <FontAwesomeIcon
                icon={faEdit}
                className="text-gray-500 text-sm"
              />
            </div>
            {/* Add more chat titles as needed */}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
