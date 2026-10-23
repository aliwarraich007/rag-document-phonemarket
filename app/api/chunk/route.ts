import { readDocument } from "@/@core/helpers/document-processor";

export async function POST(req: Request) {
  try {
    // reads all documents in lib/data/
    const documents = await readDocument();
    if (!documents || !documents.length) throw new Error("No data to read");
    // for now lets create embedding of only 1 document;
    // question: do we need to chunk this data? if yes? why and how?

    const firstdocument = documents[0];

    // const embeddings = new GoogleGenerativeAIEmbeddings({
    //   model: "gemini-embedding-2",
    //   outputDimensionality: 1536,
    // });

    // const vectors = embeddings.embedDocuments([...firstdocument.content]);
    // console.log(vectors);

    return Response.json({
      message: "vectorized",
    });
  } catch (err) {
    console.error("ERROR WHILE CREATING CHUNKING AND EMBEDDING: ", err);
    return Response.error();
  }
}
