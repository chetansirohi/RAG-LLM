import Navbar from "@/components/Navbar";
import Image from "next/image";
import Main from "@/components/Main";
import HowItWorks from "@/components/HowItWorks";

export default function Home() {
  return (
    <main className="flex flex-col flex-grow">
      <section className="w-full min-h-screen flex items-center justify-center">
        <Main />
      </section>
      <section className="w-full min-h-screen flex items-center justify-center">
        <HowItWorks />
      </section>
    </main>
  );
}
