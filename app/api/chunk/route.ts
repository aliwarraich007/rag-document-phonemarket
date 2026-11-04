import { chunkDocument } from "@/@core/helpers/document-processor";
import { db } from "@/lib/db";
import { documentChunks } from "@/lib/db/schema";
import { createGoogle } from "@ai-sdk/google";
import { embedMany } from "ai";

export async function POST(_req: Request) {
  try {
    const chunks = await chunkDocument(800);

    if (chunks.length === 0) {
      return Response.json({
        chunks: 0,
        dimension: 1536,
      });
    }

    const google = createGoogle({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });

    const { embeddings } = await embedMany({
      model: google.embeddingModel("gemini-embedding-2"),
      values: chunks.map((chunk) => chunk.content),
      providerOptions: {
        google: {
          outputDimensionality: 1536,
        },
      },
    });

    if (
      embeddings.length !== chunks.length ||
      embeddings.some((embedding) => embedding.length !== 1536)
    ) {
      throw new Error("Invalid embedding generation");
    }

    const records = chunks.map((chunk, index) => ({
      id: crypto.randomUUID(),
      content: chunk.content,
      embedding: embeddings[index],
      metadata: chunk.metadata,
    }));

    await db.transaction(async (tx) => {
      await tx.delete(documentChunks);

      await tx.insert(documentChunks).values(records);
    });

    return Response.json({
      chunks: chunks.length,
      dimension: embeddings[0].length,
    });
  } catch (error) {
    console.error("ERROR WHILE CREATING CHUNKS AND EMBEDDINGS:", error);

    return Response.json(
      { error: "Failed to create document embeddings" },
      { status: 500 },
    );
  }
}
