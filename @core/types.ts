export type DocumentMetadata = {
  heading?: string;
  source?: string;
};

export type SearchRow = {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  similarity: number;
};
