import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import UserMenuButton from "./UserMenuButton";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

const Navbar: React.FC = async () => {
  const session: Session | null = await getServerSession(authOptions);

  return (
    <nav className="flex items-center justify-between w-full px-4 fixed top-0 bg-white shadow-md z-50 mb-2">
      <Link href="/" passHref>
        <Image
          src="/assets/logo.png"
          alt="chatty-logo"
          width={70}
          height={70}
          className="object-contain"
        />
      </Link>
      <Link href="/">
        <p className="flex justify-center text-[30px] md:text-[50px] items-center">
          Chatty
        </p>
      </Link>

      <div className="flex items-center">
        {session && (
          <Link href="/chat" passHref>
            <Button className="hidden md:inline-block mr-2">Chat Now</Button>
          </Link>
        )}
        <UserMenuButton session={session} />
      </div>
    </nav>
  );
};

export default Navbar;
