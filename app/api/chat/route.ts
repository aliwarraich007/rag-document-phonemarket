import { UIMessage, createUIMessageStreamResponse } from "ai";
import { ChatGoogle } from "@langchain/google";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { readDocument } from "@/@core/helpers/read-document";

export async function POST(req: Request) {
  // messages & histroy of AI + User of type UIMessages from Vercel SDK
  // contains
  const { messages }: { messages: UIMessage[] } = await req.json();
  // messages contains the history of messages between system, assistant and user
  // user -> user
  // assitant -> llm
  // system -> prompts

  // It controls randomness when the model picks the next token.
  // Low values (0 to 0.3) give more predictable, repeatable answers,
  // and higher values give more varied ones. High temperature can
  // make hallucinations more likely, but low temperature
  // doesn’t make the model truthful.
  // Grounding answers in real documents is what does that,
  //  and that’s what RAG is for. For a support bot,
  //  0.2 to 0.3 is a sensible default.

  const documents = await readDocument();

  documents?.forEach((file) => {
    console.log(file.content);
  });

  const model = new ChatGoogle({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    model: "gemini-3.8-flash",
    temperature: 0.6,
  });

  // coverting the Vercel messages type to Langchain type
  const langchainMessages = await toBaseMessages(messages);

  const stream = await model.stream(langchainMessages);

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
