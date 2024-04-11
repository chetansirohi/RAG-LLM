// // pages/chat/index.js
// import { getServerSideProps } from 'next';
// import Sidebar from "./Sidebar";
// import ChatScreen from "./ChatScreen";
// import prisma from "@/lib/db/prisma"; // Adjust the import path as needed

// export const getServerSideProps = async (context) => {
//   // Fetch chat sessions and associated data from your database using Prisma
//   const chats = await prisma.chat.findMany({
//     // Your query here
//   });

//   // Pass chats to the page via props
//   return { props: { chats } };
// };

// const ChatPage = ({ chats }) => {
//   // Functions to handle chat operations
//   const handleNewChat = async () => {
//     // Implement chat creation logic, potentially making an API request to your backend
//   };

//   // Pass chats and handlers as props to Sidebar
//   return (
//     <div>
//       <Sidebar
//         chats={chats}
//         onNewChat={handleNewChat}
//         // Pass other handlers similarly
//       />
//       <ChatScreen />
//     </div>
//   );
// };

// export
