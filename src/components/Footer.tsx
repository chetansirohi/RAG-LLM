import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faLinkedinIn,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white text-center p-4">
      <div className="flex flex-col items-center mb-4">
        <Image
          src="/assets/logo.png"
          alt="Chatty Logo"
          width={70}
          height={70}
        />
        <h2 className="text-xl mt-2">Chatty</h2>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center text-lg">
        {" "}
        <div className="mb-4 md:mb-0 px-2">© 2024 Chatty</div>
        <div className="mb-4 md:mb-0">🛠️ by Chetan Sirohi</div>
        <div className="flex justify-center px-2 gap-2">
          <a
            href="https://twitter.com/SirohiChetan"
            className="mx-2"
            target="_blank"
            rel="noopernser noreferer"
          >
            <FontAwesomeIcon icon={faTwitter} size="lg" />{" "}
          </a>
          <a
            href="https://www.linkedin.com/in/chetan-sirohi-29974b169/"
            className="mx-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedinIn} size="lg" />{" "}
          </a>
          <a
            href="https://github.com/chetansirohi"
            className="mx-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} size="lg" />{" "}
          </a>
        </div>
      </div>
    </footer>
  );
}
