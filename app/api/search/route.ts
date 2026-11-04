import { createGoogle } from "@ai-sdk/google";
import { embed } from "ai";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { SearchRow } from "@/@core/types";
export async function POST(_req: Request) {
  try {
    const searchTerm = new URL(_req.url).searchParams.get("q") ?? "";
    if (!searchTerm.trim().length) throw new Error("No Search Query");

    const google = createGoogle({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });

    const { embedding } = await embed({
      model: google.embeddingModel("gemini-embedding-2"),
      value: searchTerm,
      providerOptions: {
        google: {
          outputDimensionality: 1536,
        },
      },
    });

    if (!embedding) throw new Error("Error Creating embeddings");

    const vector = `[${embedding.join(",")}]`;

    const result = await db.execute(
      sql`SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> ${vector}::vector) AS similarity
  FROM document_chunk
  ORDER BY embedding <=> ${vector}::vector
  LIMIT 5`,
    );

    const rows = (result as unknown as { rows: SearchRow[] }).rows;

    const response = rows.map((r) => ({
      heading: r.metadata.heading,
      source: r.metadata.source,
      similarity: Number(r.similarity.toFixed(3)),
      preview: r.content.slice(0, 120),
    }));
    console.log(response);

    return Response.json(response);
  } catch (err) {
    console.log("SEARCH API ERROR: ", err);
  }
}
