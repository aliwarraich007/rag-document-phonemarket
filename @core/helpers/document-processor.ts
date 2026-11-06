import "server-only";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { Chunk } from "../interface";
import { createGoogle } from "@ai-sdk/google";
import { embed } from "ai";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { SearchRow } from "@/@core/types";

export async function readDocument() {
  try {
    const currentDir = process.cwd();
    const directoryPath = path.join(currentDir, "lib/data");
    const files = await readdir(directoryPath);

    return await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(directoryPath, fileName);
        const file = await readFile(filePath, "utf-8");
        return {
          fileName: fileName,
          content: file,
        };
      }),
    );
  } catch (err) {
    console.error("Error while reading document", err);
  }
}

function splitText(
  file: { fileName: string; content: string },
  size: number,
): Chunk[] {
  const chunks: Chunk[] = [];

  const [titlePiece, ...sectionPieces] = file.content.split(/^## /m);
  const title = titlePiece.replace(/^#\s*/, "").trim();

  for (const piece of sectionPieces) {
    const newline = piece.indexOf("\n");
    const heading = (newline === -1 ? piece : piece.slice(0, newline)).trim();
    const body = newline === -1 ? "" : piece.slice(newline).trim();

    // prefix depends on the heading, so it is built per section
    const prefix = `# ${title}\n## ${heading}\n\n`;
    const budget = size - prefix.length;
    if (budget <= 0) throw new Error("size is smaller than the heading prefix");

    for (const part of splitBody(body, budget)) {
      chunks.push({
        content: prefix + part,
        metadata: {
          source: file.fileName,
          title,
          heading,
          index: chunks.length,
        },
      });
    }
  }
  return chunks;
}

const LEVELS = [
  {
    split: /\n\n/,
    join: "\n\n",
  }, // paragraphs
  {
    split: /\n/,
    join: "\n",
  }, // lines
  {
    split: /(?<=[.!?])\s+/,
    join: " ",
  }, // scentences
  {
    split: / /,
    join: " ",
  }, // words (last opotion)
];

// Goal: take one string and return an array of strings, each <= max characters,
// cutting at the biggest natural boundary that works.
//
// `level` is an index into LEVELS: 0 = paragraphs, 1 = lines,
// 2 = sentences, 3 = words. A higher level means a smaller separator.
function splitBody(text: string, max: number, level: number = 0): string[] {
  // BASE CASE 1: the text already fits, so there is nothing to split.
  // Most short FAQ answers stop here.
  if (text.length <= max) return [text];

  // BASE CASE 2: we've tried every separator (even words) and it's still
  // too long. Give up and return it whole. This also stops infinite recursion.
  if (level >= LEVELS.length) return [text];

  // `out` collects the finished pieces.
  const out: string[] = [];

  // Pick the separator for this level. `split` is a regex for cutting the text,
  // `join` is what we put back between parts when we glue them into one piece.
  const { split, join } = LEVELS[level];

  // `current` is the piece we're building. We keep adding parts to it
  // until the next one wouldn't fit.
  let current = "";

  for (const part of text.split(split)) {
    // CASE A: this single part is bigger than max, so packing can't help.
    // Save what we've built so far, then recurse on this part with the
    // NEXT, smaller separator (paragraph -> line -> sentence -> word).
    if (part.length > max) {
      if (current) {
        out.push(current);
        current = "";
      }
      out.push(...splitBody(part, max, level + 1)); // the recursive step
      continue; // move on to the next part
    }

    // CASE B: the part is small enough on its own. Try appending it to
    // `current`. If `current` is empty, the candidate is just the part.
    const candidate = current ? current + join + part : part;

    if (candidate.length <= max) {
      // It still fits, so keep packing.
      current = candidate;
    } else {
      // Adding it would overflow: save `current` as a finished piece
      // and start a new piece with this part.
      // (`current` can't be empty here, because an empty `current` means
      // candidate === part, and part <= max, so we'd be in the branch above.)
      out.push(current);
      current = part;
    }
  }

  // The loop ends with one unfinished piece in `current`; save it.
  if (current) out.push(current);

  return out;
}

export async function chunkDocument(chunkLength: number): Promise<Chunk[]> {
  if (chunkLength < 0) throw new Error("Please enter a valid chunk length");
  const documents = await readDocument();
  if (!documents || !documents.length) throw new Error("No data to read");
  return documents.flatMap((f) => splitText(f, chunkLength));
}

export const google = createGoogle({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export async function retrieveChunks(question: string, limit: number = 5) {
  if (!question.trim()) return [];

  const { embedding } = await embed({
    model: google.embeddingModel("gemini-embedding-2"),
    value: question,
    providerOptions: { google: { outputDimensionality: 1536 } },
  });

  const vector = `[${embedding.join(",")}]`;

  const result = await db.execute(
    sql`SELECT id, content, metadata,
          1 - (embedding <=> ${vector}::vector) AS similarity
        FROM document_chunk
        ORDER BY embedding <=> ${vector}::vector
        LIMIT ${limit}`,
  );

  const rows = (result as unknown as { rows: SearchRow[] }).rows;

  return rows.map((r) => ({
    content: r.content,
    source: r.metadata.source,
    heading: r.metadata.heading,
    similarity: Number(Number(r.similarity).toFixed(3)),
  }));
}
