"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { status: "approved", count: 450, fill: "var(--color-approved)" },
  { status: "pending", count: 120, fill: "var(--color-pending)" },
  { status: "returned", count: 45, fill: "var(--color-returned)" },
  { status: "archived", count: 85, fill: "var(--color-archived)" },
]

const chartConfig = {
  approved: {
    label: "Approved",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
  returned: {
    label: "Returned",
    color: "hsl(var(--chart-4))",
  },
  archived: {
    label: "Archived",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartPieLabel() {
  const total = chartData.reduce((a, b) => a + b.count, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Document Status</CardTitle>
        <CardDescription>
          Distribution of document processing status
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <tspan
                x="50%"
                y="50%"
                className="fill-foreground text-3xl font-bold"
              >
                {total.toLocaleString()}
              </tspan>
              <tspan
                x="50%"
                y="65%"
                className="fill-muted-foreground text-sm"
              >
                Total
              </tspan>
            </text>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
