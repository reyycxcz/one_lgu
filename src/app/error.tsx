"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(#7CFF8A_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      
      <div className="max-w-md space-y-6 z-10">
        <span className="micro-label">SYSTEM FAILURE</span>
        <h1 className="font-pixel text-5xl leading-none uppercase text-destructive">AN ERROR OCCURRED</h1>
        <p className="text-sm text-foreground/60 font-sans">
          A processing error occurred during layout compilation or API dispatch. This incident has been logged.
        </p>
        <div>
          <button
            onClick={() => reset()}
            className="green-chip text-xs py-2.5 px-6 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-4.5 w-4.5" /> Re-initialize Layout
          </button>
        </div>
      </div>
    </div>
  );
}
