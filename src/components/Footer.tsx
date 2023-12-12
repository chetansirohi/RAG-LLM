// components/Footer.js
import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faLinkedinIn,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-4">
        <Image
          src="/assets/images/logo.png"
          alt="Chatty Logo"
          width={70}
          height={70}
        />
        <h2 className="text-xl mt-2">Chatty</h2> {/* Increased title size */}
      </div>

      {/* Footer Content */}
      <div className="flex flex-col md:flex-row justify-between items-center text-lg">
        {" "}
        {/* Increased font size */}
        <div className="mb-4 md:mb-0 px-2">© 2023 Chatty</div>
        <div className="mb-4 md:mb-0">Made with love by Chetan Sirohi</div>
        <div className="flex justify-center px-2 gap-2">
          <a href="https://twitter.com/" className="mx-2">
            <FontAwesomeIcon icon={faTwitter} size="lg" />{" "}
            {/* Increased icon size */}
          </a>
          <a href="https://linkedin.com/" className="mx-2">
            <FontAwesomeIcon icon={faLinkedinIn} size="lg" />{" "}
            {/* Increased icon size */}
          </a>
          <a href="https://github.com/" className="mx-2">
            <FontAwesomeIcon icon={faGithub} size="lg" />{" "}
            {/* Increased icon size */}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
