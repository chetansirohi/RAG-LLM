import React from "react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

import UserMenuButton from "./UserMenuButton";
import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  return (
    <nav className="flex items-center justify-between w-full px-4">
      <Link href="/" passHref>
        <Image
          src="/assets/logo.png"
          alt="chatty-logo"
          width={70}
          height={70}
          className="object-contain"
        />
      </Link>
      <p className="flex justify-center text-[30px] md:text-[50px] items-center">
        Chatty
      </p>
      <div className="flex items-center">
        {session && (
          <Link href="/chat" passHref>
            <Button className="hidden md:inline-block mr-2">New Chat</Button>
          </Link>
        )}
        <UserMenuButton session={session} />
      </div>
    </nav>
  );
}
