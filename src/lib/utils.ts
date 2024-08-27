import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchChatSessions() {
  try {
    const response = await fetch(`/api/chats`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch chats");
      return [];
    }
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export async function createNewChat(chatsLength: number) {
  try {
    const response = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `Conversation ${chatsLength + 1}`,
      }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to create new chat");
      return null;
    }
  } catch (error) {
    console.error("Error creating new chat:", error);
    return null;
  }
}