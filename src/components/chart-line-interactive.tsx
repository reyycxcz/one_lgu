"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
  { date: "2024-01-01", compliance: 72 },
  { date: "2024-01-15", compliance: 75 },
  { date: "2024-02-01", compliance: 78 },
  { date: "2024-02-15", compliance: 80 },
  { date: "2024-03-01", compliance: 76 },
  { date: "2024-03-15", compliance: 82 },
  { date: "2024-04-01", compliance: 85 },
  { date: "2024-04-15", compliance: 83 },
  { date: "2024-05-01", compliance: 88 },
  { date: "2024-05-15", compliance: 86 },
  { date: "2024-06-01", compliance: 90 },
  { date: "2024-06-15", compliance: 87 },
]

const chartConfig = {
  compliance: {
    label: "Compliance Rate",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartLineInteractive() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Compliance Trend</CardTitle>
        <CardDescription>
          Barangay compliance rate over time
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Line
              dataKey="compliance"
              type="monotone"
              stroke="var(--color-compliance)"
              strokeWidth={2}
              dot={{ fill: "var(--color-compliance)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
