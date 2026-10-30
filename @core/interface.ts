export interface Chunk {
  metadata: {
    source: string;
    heading: string;
    title: string;
    index: number;
  };
  content: string;
}
