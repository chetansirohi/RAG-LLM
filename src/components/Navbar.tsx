import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import UserMenuButton from "./UserMenuButton";
import { auth } from "@/lib/auth";

const Navbar: React.FC = async () => {
  const session = await auth();
  return (
    <nav className="flex items-center justify-between w-full px-4 fixed top-0 bg-white shadow-md z-50 mb-2 h-16">
      <Link href="/" passHref>
        <Image
          src="/assets/logo.png"
          alt="chatty-logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </Link>
      <Link href="/">
        <p className="flex justify-center text-[24px] md:text-[36px] items-center">
          Chatty
        </p>
      </Link>

      <div className="flex items-center">
        <UserMenuButton session={session} />
      </div>
    </nav>
  );
};

export default Navbar;
