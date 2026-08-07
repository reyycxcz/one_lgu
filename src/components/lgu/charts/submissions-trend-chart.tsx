"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  reports: { label: "Reports", color: "#16A34A" },
  certifications: { label: "Certifications", color: "#2563EB" },
  complaints: { label: "Complaints", color: "#F59E0B" },
} satisfies ChartConfig;

export function SubmissionsTrendChart({
  data,
}: {
  data: { date: string; reports: number; certifications: number; complaints: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Submissions</CardTitle>
        <CardDescription>Reports, certification requests, and complaints over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <BarChart data={data} barCategoryGap={4}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} width={28} />
            <ChartTooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  indicator="dot"
                />
              }
            />
            <Bar dataKey="reports" fill="var(--color-reports)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="certifications" fill="var(--color-certifications)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="complaints" fill="var(--color-complaints)" radius={[3, 3, 0, 0]} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
