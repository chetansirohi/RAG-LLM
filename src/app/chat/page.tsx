import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatScreen from "@/components/ChatScreen";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/chat");
  }

  return (
    // Flex container for the full page
    <div className="flex  w-full h-screen py-[4rem] overflow-x-hidden">
      {/* Sidebar: Takes up 1/3 of the width */}
      <div className="w-1/3 h-full overflow-y-auto">
        <Sidebar />
      </div>

      {/* ChatScreen: Takes up 2/3 of the width */}
      <div className="w-2/3 h-full overflow-y-auto">
        <ChatScreen />
      </div>
    </div>
  );
}
