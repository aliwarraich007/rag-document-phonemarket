import type { UIMessage } from "ai";
import { AlertCircleIcon } from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

type Props = {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error?: Error;
  onSuggestion: (text: string) => void;
};

const SUGGESTIONS = [
  "Explain this error message",
  "Refactor a React component",
  "Write unit tests for a function",
  "Review my pull request description",
];

function getText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatWindow({ messages, status, error, onSuggestion }: Props) {
  if (messages.length === 0) {
    return <EmptyState onSuggestion={onSuggestion} />;
  }

  const last = messages[messages.length - 1];
  // Request sent, but no assistant text has arrived yet.
  const isThinking =
    status === "submitted" ||
    (status === "streaming" && last?.role === "assistant" && !getText(last));

  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="relative min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
            {messages.map((message) => {
              const text = getText(message);
              if (!text) return null;

              return (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.role === "user"}
                >
                  {message.role === "user" ? (
                    <Message align="end">
                      <MessageContent>
                        <Bubble align="end" variant="muted">
                          <BubbleContent className="whitespace-pre-wrap">
                            {text}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  ) : (
                    <Message align="start">
                      <MessageContent>
                        <div className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
                          {text}
                        </div>
                      </MessageContent>
                    </Message>
                  )}
                </MessageScrollerItem>
              );
            })}

            {isThinking && <TypingIndicator />}
            {error && <ErrorNotice message={error.message} />}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

function EmptyState({ onSuggestion }: Pick<Props, "onSuggestion">) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        What are you working on?
      </h1>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion(suggestion)}
            className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 py-2"
      role="status"
      aria-label="Assistant is responding"
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-pulse rounded-full bg-muted-foreground motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
    >
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      <span>
        Something went wrong: {message}. Try sending your message again.
      </span>
    </div>
  );
}
