import { chunkDocument } from "@/@core/helpers/document-processor";
import { db } from "@/lib/integrations/prisma/db";
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

    if (values.length !== embeddings.length)
      throw new Error("Invalid embedding generation");

    // Build queries OUTSIDE the transaction using db.raw.sql
    const deleteQuery = db.raw.sql`DELETE FROM document_chunk`
      .affectedCount()
      .build();

    await db.transaction(async (tx) => {
      // Execute the pre-built query INSIDE the transaction
      await tx.execute(deleteQuery);

      for (let i = 0; i < chunks.length; i++) {
        const vector = `[${embeddings[i].join(",")}]`;

        const insertQuery = db.raw.sql`
      INSERT INTO document_chunk (id, content, embedding, metadata)
      VALUES (
        ${crypto.randomUUID()},
        ${chunks[i].content},
        ${vector}::vector,
        ${JSON.stringify(chunks[i].metadata)}::jsonb
      )
    `
          .affectedCount()
          .build();

        await tx.execute(insertQuery);
      }
    });

    return Response.json({
      chunks: chunks.length,
      dimension: embeddings[0].length,
    });
  } catch (err) {
    console.error("ERROR WHILE CREATING CHUNKING AND EMBEDDING: ", err);
    return Response.error();
  }
}
