import React from "react";
import Sidebar from "@/components/ChatBox/Sidebar";
import ChatScreen from "@/components/ChatBox/ChatScreen";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/chat");
    return null;
  }

  return (
    // Flex container for the full page
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden">
      {/* Sidebar: Takes up 1/3 of the width */}
      <aside className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-1/6 2xl:w-1/7 h-full overflow-y-auto">
        <Sidebar />
      </aside>

      {/* ChatScreen: Takes up 2/3 of the width */}
      <div className="w-full md:w-3/4 lg:w-4/5 xl:w-5/6 2xl:w-6/7 h-full overflow-y-auto">
        <ChatScreen />
      </div>
    </div>
  );
}
