"use client";

import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--muted-foreground))",
];

export function CategoryPieChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: { category: string; count: number }[];
}) {
  const chartConfig = data.reduce((acc, d, i) => {
    acc[d.category] = { label: d.category.replace(/_/g, " "), color: COLORS[i % COLORS.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-square h-[280px] w-full mx-auto">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="category" innerRadius={50} strokeWidth={2}>
              {data.map((entry, i) => (
                <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
