// components/NewChatButton.tsx
import Link from "next/link";
import { Button } from "./ui/button";

const NewChatButton = () => {
  return (
    <Link href="/chat" passHref>
      <Button as="a" className="ml-2">
        New Chat
      </Button>
    </Link>
  );
};

export default NewChatButton;
