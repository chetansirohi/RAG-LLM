"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";

const ChatButton = () => {
  const pathname = usePathname();

  if (pathname === "/chat") {
    return null;
  }

  return (
    <Link href="/chat" passHref>
      <Button className="hidden md:inline-block mr-2">Chat Now</Button>
    </Link>
  );
};

export default ChatButton;
