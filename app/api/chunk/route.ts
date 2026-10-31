import { chunkDocument } from "@/@core/helpers/document-processor";
import { createGoogle } from "@ai-sdk/google";
import { embedMany } from "ai";

export async function POST(req: Request) {
  try {
    const chunks = await chunkDocument(800);

    const values = chunks.map((c) => c.content);

    const google = createGoogle({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });
    const { embeddings } = await embedMany({
      model: google.embeddingModel("gemini-embedding-2"),
      values,
      providerOptions: {
        google: {
          outputDimensionality: 1536,
        },
      },
    });

    console.log(embeddings);

    return Response.json({
      message: "vectorized",
    });
  } catch (err) {
    console.error("ERROR WHILE CREATING CHUNKING AND EMBEDDING: ", err);
    return Response.error();
  }
}
