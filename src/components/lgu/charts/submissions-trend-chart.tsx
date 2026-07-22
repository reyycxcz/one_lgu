"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  reports: { label: "Reports", color: "hsl(var(--chart-1))" },
  certifications: { label: "Certifications", color: "hsl(var(--chart-2))" },
  complaints: { label: "Complaints", color: "hsl(var(--chart-3))" },
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
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-reports)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-reports)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCertifications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-certifications)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-certifications)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillComplaints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-complaints)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-complaints)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="complaints" type="natural" fill="url(#fillComplaints)" stroke="var(--color-complaints)" stackId="a" />
            <Area dataKey="certifications" type="natural" fill="url(#fillCertifications)" stroke="var(--color-certifications)" stackId="a" />
            <Area dataKey="reports" type="natural" fill="url(#fillReports)" stroke="var(--color-reports)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
