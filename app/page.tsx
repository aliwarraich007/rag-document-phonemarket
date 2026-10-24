import { Suspense } from "react";
import { Chat } from "@/features/chat/chat-page";
import { chunkDocument } from "@/@core/helpers/document-processor";

async function ChatData() {
  const chunks = await chunkDocument(1000);

  return <Chat />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading chat...</div>}>
      <ChatData />
    </Suspense>
  );
}
