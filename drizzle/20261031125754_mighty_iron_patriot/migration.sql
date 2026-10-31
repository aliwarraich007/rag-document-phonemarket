CREATE TABLE "document_chunk" (
	"id" text PRIMARY KEY,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
