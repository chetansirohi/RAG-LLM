import Navbar from "@/components/Navbar";
import Image from "next/image";
import Main from "@/components/Main";
import HowItWorks from "@/components/HowItWorks";
// import va from "@vercel/analytics";

export default function Home() {
  return (
    <main className="flex flex-col flex-grow">
      <section className="w-full min-h-screen flex items-center justify-center py-[4rem]">
        <Main />
      </section>
      <section className="w-full min-h-screen flex items-center justify-center py-[4rem]">
        <HowItWorks />
      </section>
    </main>
  );
}
