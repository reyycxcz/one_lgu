"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  approvalRate: { label: "Approval Rate %", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function ComplianceTrendChart({
  data,
}: {
  data: { month: string; approvalRate: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Compliance Rate</CardTitle>
        <CardDescription>Report approval rate over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} unit="%" width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line dataKey="approvalRate" type="monotone" stroke="var(--color-approvalRate)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
