import Navbar from "@/components/Navbar";
import Image from "next/image";
import Main from "@/components/Main";
import HowItWorks from "@/components/HowItWorks";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-2">
      <section className="w-full">
        <Main />
      </section>
      <section className="w-full">
        <HowItWorks />
      </section>
    </main>
  );
}
