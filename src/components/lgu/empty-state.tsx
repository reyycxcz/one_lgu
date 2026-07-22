export function LguEmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center gap-2">
      <div className="text-muted-foreground/40 [&>svg]:h-8 [&>svg]:w-8">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
