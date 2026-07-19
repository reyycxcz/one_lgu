"use client";

import { cn } from "@/lib/utils";
import {
  Table as RTable,
  TableHeader as RTableHeader,
  TableBody as RTableBody,
  Column as RColumn,
  Row as RRow,
  Cell as RCell,
  type TableProps as RTableProps,
  type ColumnProps,
  type RowProps,
  type CellProps,
} from "react-aria-components";

function TableHeader({ children, className, ...props }: React.ComponentProps<typeof RTableHeader>) {
  return <RTableHeader className={cn("", className)} {...props}>{children}</RTableHeader>;
}

function Head({ children, className, ...props }: React.ComponentProps<typeof RColumn>) {
  return <RColumn className={cn("px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left", className)} {...props}>{children}</RColumn>;
}

function TableBody({ children, className, ...props }: React.ComponentProps<typeof RTableBody>) {
  return <RTableBody className={cn("divide-y divide-border text-xs font-sans", className)} {...props}>{children}</RTableBody>;
}

function Row({ children, className, ...props }: React.ComponentProps<typeof RRow>) {
  return <RRow className={cn("hover:bg-muted/20 transition-colors", className)} {...props}>{children}</RRow>;
}

function Cell({ children, className, ...props }: React.ComponentProps<typeof RCell>) {
  return <RCell className={cn("px-5 py-3", className)} {...props}>{children}</RCell>;
}

function TableComponent({ children, className, ...props }: React.ComponentProps<typeof RTable>) {
  return <RTable className={cn("w-full text-left", className)} {...props}>{children}</RTable>;
}

export const Table = Object.assign(TableComponent, {
  Header: TableHeader,
  Head,
  Body: TableBody,
  Row,
  Cell,
});
