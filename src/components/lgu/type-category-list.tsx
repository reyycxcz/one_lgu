import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export async function TypeCategoryList({
  title,
  description,
  table,
  column,
  values,
}: {
  title: string;
  description: string;
  table: "certification_requests" | "reports" | "complaints";
  column: string;
  values: string[];
}) {
  const supabase = await createClient();
  const { data } = await supabase.from(table).select(column);

  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, 0));
  (data || []).forEach((row: any) => {
    const v = row[column];
    counts.set(v, (counts.get(v) || 0) + 1);
  });

  return (
    <div className="space-y-6">
      <LguPageHeader title={title} description={description} />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Records Using This Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {values.map((v) => (
                <TableRow key={v}>
                  <TableCell className="font-medium capitalize">{v.replace(/_/g, " ")}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{counts.get(v) || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        These types are currently fixed by the database schema. Adding or removing types requires a migration.
      </p>
    </div>
  );
}
