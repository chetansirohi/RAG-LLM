import React from "react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between w-full border-b-4 ">
      <Link href="/" className="flex items-center px-4">
        <Image
          src="/assets/images/logo.png"
          alt="chatty-logo"
          width={70}
          height={70}
          className="object-contain "
        />
      </Link>
      <p className="flex justify-center text-[30px] md:text-[50px] items-center">
        Chatty
      </p>
      <div className="flex items-center px-4">
        <Button className=" hover:bg-gray-700  ">Try Now</Button>
      </div>
    </nav>
  );
};

export default Navbar;
