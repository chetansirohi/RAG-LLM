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
            src="/assets/logo.png"
            alt="Product"
            width={170}
            height={170}
            className="max-w-md w-full h-auto"
          />
        </div>

        {/* Text Column */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4 md:text-4xl">How It Works</h2>
          <ul className=" list-inside mb-4">
            <li className="mb-2">
              <b>Input and Retrieve:</b> Input queries or external data; Chatty
              retrieves relevant information through vector matching.
            </li>
            <li className="mb-2">
              <b>Augment and Respond:</b> Integrates retrieved data with LLM for
              accurate, context-rich responses.
            </li>
            <li className="mb-2">
              <b>Continuous Update:</b> Regularly refreshes data sources to
              ensure up-to-date, relevant information.
            </li>
          </ul>
          {/* <Button className=" hover:bg-gray-700  ">Try Now</Button> */}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
