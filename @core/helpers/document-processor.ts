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

const split = [{ "#": "header 1" }, { "##": "header 2" }];

function splitText(
  file: { fileName: string; content: string },
  size: number,
): Chunk[] {
  const chunks: Chunk[] = [];

  let title = "";

  const sections = file.content.split("##");

  if (!title.length && sections[0].length > 0) {
    title = sections[0];
  }

  console.log(sections);

  return chunks;
}

export async function chunkDocument(chunkLength: number) {
  try {
    if (chunkLength < 0) throw new Error("Please enter a valid chunk length");

    const documents = await readDocument();

    if (!documents || !documents.length) throw new Error("No data to read");

    const testDocument = documents[0];

    splitText(testDocument, chunkLength);

    // documents.map((f) => splitText(f, chunkLength));
  } catch (err) {
    console.error("Error while chunking: ", err);
  }
}
