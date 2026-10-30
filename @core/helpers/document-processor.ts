import "server-only";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { Chunk } from "../interface";

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

    if (body.length >= size) {
    }
    chunks.push({
      content: `# ${title}\n## ${heading}\n\n${body}`,
      metadata: { source: file.fileName, title, heading, index: chunks.length },
    });
  }
  return chunks;
}

function recursivePackChunks(chunks: Chunk[], size: number) {
  const newChunk: Chunk[] = [];
  for (const chunk of chunks) {
    const content = chunk.content;

    if (content.length > size) {
      const [titleAndQuestion, text] = content.split("## ");
      const chunkedText = text.split(".");

      const newText = `${titleAndQuestion} ## ${chunkedText}`;

      newChunk.push({
        content: newText,
        metadata: {
          ...chunk.metadata,
        },
      });
    }
  }
  recursivePackChunks(newChunk, size);
}

export async function chunkDocument(chunkLength: number) {
  try {
    if (chunkLength < 0) throw new Error("Please enter a valid chunk length");

    const documents = await readDocument();

    if (!documents || !documents.length) throw new Error("No data to read");

    const testDocument = documents[0];

    const r = splitText(testDocument, chunkLength);
    console.log(r);

    // documents.map((f) => splitText(f, chunkLength));
  } catch (err) {
    console.error("Error while chunking: ", err);
  }
}
