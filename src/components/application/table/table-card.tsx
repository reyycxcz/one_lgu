import { cn } from "@/lib/utils";

interface TableCardRootProps {
  children: React.ReactNode;
  className?: string;
}

function Root({ children, className }: TableCardRootProps) {
  return (
    <div className={cn("border border-border rounded-lg bg-card overflow-hidden", className)}>
      {children}
    </div>
  );
}

interface TableCardHeaderProps {
  title: string;
  badge?: string;
  contentTrailing?: React.ReactNode;
  className?: string;
}

function Header({ title, badge, contentTrailing, className }: TableCardHeaderProps) {
  return (
    <div className={cn("relative flex items-center justify-between px-5 py-4 border-b border-border", className)}>
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {badge && (
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {contentTrailing}
    </div>
  );
}

export const TableCard = { Root, Header };
