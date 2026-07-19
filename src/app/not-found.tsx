import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(#7CFF8A_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      
      <div className="max-w-md space-y-6 z-10">
        <span className="micro-label">ERROR 404</span>
        <h1 className="font-sans font-black text-6xl md:text-7xl leading-none uppercase">PAGE NOT FOUND</h1>
        <p className="text-sm text-foreground/60 font-sans">
          The requested system route does not exist or has been restricted under 7-layer validation protocols.
        </p>
        <div>
          <Link href="/" className="green-chip text-xs py-2.5 px-6 inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4.5 w-4.5" /> Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
}

