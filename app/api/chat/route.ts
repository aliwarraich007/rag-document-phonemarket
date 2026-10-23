import {
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { createGoogle } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const google = createGoogle({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  const result = streamText({
    model: google("gemini-3.5-flash-lite"),
    messages: await convertToModelMessages(messages),
  });

  // const model = new ChatGoogle({
  //   apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  //   model: "gemini-3.8-flash",
  //   temperature: 0.6,
  // });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
