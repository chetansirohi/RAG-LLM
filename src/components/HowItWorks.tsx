// pages/index.js
import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";

const IndexPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center">
        {/* Image Column */}
        <div className="flex-1 flex justify-center mb-8 md:mb-0">
          <Image
            src="/assets/images/logo.png"
            alt="Product"
            width={170}
            height={170}
            className="max-w-md w-full h-auto"
          />
        </div>

        {/* Text Column */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <ul className=" list-inside mb-4">
            <li>First important point or feature.</li>
            <li>Second important point or feature.</li>
            <li>Third important point or feature.</li>
          </ul>
          <Button className=" hover:bg-gray-700  ">Try Now</Button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
