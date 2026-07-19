"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
  { month: "January", pending: 45, completed: 120, returned: 15 },
  { month: "February", pending: 38, completed: 145, returned: 12 },
  { month: "March", pending: 52, completed: 165, returned: 18 },
  { month: "April", pending: 28, completed: 180, returned: 8 },
  { month: "May", pending: 35, completed: 195, returned: 10 },
  { month: "June", pending: 42, completed: 210, returned: 14 },
]

const chartConfig = {
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  returned: {
    label: "Returned",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function ChartBarMixed() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Report Status</CardTitle>
        <CardDescription>
          Monthly report processing breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="returned" fill="var(--color-returned)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
