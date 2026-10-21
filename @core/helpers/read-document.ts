import { readdir, readFile } from "fs/promises";
import path from "path";

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
