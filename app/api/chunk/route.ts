import { readDocument } from "@/@core/helpers/read-document";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function POST(req: Request) {
  try {
    // reads all documents in lib/data/
    const documents = await readDocument();
    if (!documents || !documents.length) throw new Error("No data to read");
    // for now lets create embedding of only 1 document;
    // question: do we need to chunk this data? if yes? why and how?

    const firstdocument = documents[0];

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-2",
      outputDimensionality: 1536,
    });

    const vectors = embeddings.embedDocuments([...firstdocument.content]);
    console.log(vectors);

    return {
      message: "Document embedding successfull",
    };
  } catch (err) {
    console.error("ERROR WHILE CREATING CHUNKING AND EMBEDDING: ", err);
  }
}
