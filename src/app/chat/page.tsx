import React from "react";
import Sidebar from "@/components/ChatBox/Sidebar";
import ChatScreen from "@/components/ChatBox/ChatScreen";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ChatButton from "@/components/ChatButton";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/chat");
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden">
      <Sidebar />
      <div className="w-full h-full overflow-y-auto">
        <ChatButton />
        <ChatScreen />
      </div>
    </div>
  );
}
