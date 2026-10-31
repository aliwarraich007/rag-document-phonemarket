import { Suspense } from "react";
import { Chat } from "@/features/chat/chat-page";

async function ChatData() {
  return <Chat />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading chat...</div>}>
      <ChatData />
    </Suspense>
  );
}
