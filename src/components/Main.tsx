import React from "react";
import Image from "next/image";

export default function Main() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Text Column */}
        <div className="flex-1 flex items-center justify-center text-center ">
          <div>
            <h1 className="md:text-6xl font-bold mb-4">
              Want a chatbot that's as current as today's headlines?
            </h1>
            <p className="mb-4">
              Chatty stays ahead with real-time updates, ensuring you get
              relevant, context-aware insights for today's world
            </p>
          </div>
        </div>

        {/* Image Column */}
        <div className="flex-1 flex items-center justify-center">
          <Image
            src="/assets/logo.png"
            alt="Product"
            width={270}
            height={270}
            className="max-w-md w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
