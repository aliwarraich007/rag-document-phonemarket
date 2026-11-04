"use client";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { ChatWindow } from "@/features/chat/components/chat";
import { useChat } from "@ai-sdk/react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useRef, useState } from "react";
import { IngestComponent } from "./components/ingest";

export function Chat() {
  const [text, setText] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { messages, sendMessage, status, stop, error } = useChat();

  const isBusy = status === "submitted" || status === "streaming";
  const canSend = text.trim().length > 0 && !isBusy;

  function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    sendMessage({ text: text.trim() });
    setText("");
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <IngestComponent />
      <ChatWindow
        messages={messages}
        status={status}
        error={error}
        onSuggestion={(suggestion) => sendMessage({ text: suggestion })}
      />

      <div className="mx-auto w-full max-w-2xl py-12 pt-2 ">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className=" p-4 ring-2 ring-border focus-within:ring-border/50 rounded-2xl shadow-sm"
        >
          <InputGroup className="">
            <InputGroupTextarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Message the assistant"
              aria-label="Message"
              rows={1}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              className="max-h-48 min-h-0 p-3 field-sizing-content"
            />
            <InputGroupAddon align="block-end" className="justify-between">
              {isBusy ? (
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  variant="default"
                  className="rounded-full"
                  onClick={stop}
                  aria-label="Stop generating"
                >
                  <SquareIcon className="fill-current" />
                </InputGroupButton>
              ) : (
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  variant="default"
                  className="rounded-full"
                  disabled={!canSend}
                  aria-label="Send message"
                >
                  <ArrowUpIcon />
                </InputGroupButton>
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </div>
  );
}
