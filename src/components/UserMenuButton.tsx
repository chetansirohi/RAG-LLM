"use client";

import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserMenuButtonProps {
  session: Session | null;
}

export default function UserMenuButton({ session }: UserMenuButtonProps) {
  const user = session?.user;
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = () => {
    if (user) {
      if (pathname === "/chat" && isMobile) {
        // Toggle sidebar on mobile for chat page
        const event = new CustomEvent("toggleSidebar");
        window.dispatchEvent(event);
      }
    } else {
      signIn();
    }
  };

  if (!user) {
    return (
      <Button onClick={() => signIn()} className="ml-2">
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center">
      {pathname !== "/chat" && (
        <Link href="/chat" passHref>
          <Button className="mr-2">Chat Now</Button>
        </Link>
      )}
      {pathname !== "/chat" || !isMobile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer">
              <Image
                src={user.image || "/assets/profile-pic-placeholder.png"}
                alt="Profile picture"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="cursor-pointer" onClick={handleClick}>
          <Image
            src={user.image || "/assets/profile-pic-placeholder.png"}
            alt="Profile picture"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      )}
    </div>
  );
}
