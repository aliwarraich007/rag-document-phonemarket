"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export const IngestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function clickHandler() {
    setLoading(true);
    setResult(null);

    try {
      //const res = await fetch("/api/chunk", { method: "POST" });

      const res = await fetch(`/api/search?q=wat is rtrn police?`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      //  setResult(`Done: ${data.chunks} chunks, ${data.dimension} dimensions`);
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={clickHandler} disabled={loading}>
        {loading ? "Ingesting..." : "Ingest Data"}
      </Button>
      {result && <p className="text-sm">{result}</p>}
    </div>
  );
};
