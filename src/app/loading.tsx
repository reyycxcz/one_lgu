export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(#7CFF8A_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      <div className="flex flex-col items-center gap-4 z-10">
        <div className="h-10 w-10 border-2 border-border border-t-primary rounded-full animate-spin" />
        <span className="font-pixel text-lg tracking-wider text-foreground animate-pulse">
          LOADING ONELGU SYSTEM...
        </span>
      </div>
    </div>
  );
}
