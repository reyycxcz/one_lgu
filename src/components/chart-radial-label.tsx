"use client"

import * as React from "react"
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

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
  { task: "reports", score: 92, fill: "var(--color-reports)" },
  { task: "documents", score: 85, fill: "var(--color-documents)" },
  { task: "certifications", score: 78, fill: "var(--color-certifications)" },
]

const chartConfig = {
  reports: {
    label: "Reports",
    color: "hsl(var(--chart-1))",
  },
  documents: {
    label: "Documents",
    color: "hsl(var(--chart-2))",
  },
  certifications: {
    label: "Certifications",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ChartRadialLabel() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Task Completion</CardTitle>
        <CardDescription>
          Completion rates by task category
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            innerRadius={30}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              stroke="hsl(var(--border))"
            />
            <RadialBar
              dataKey="score"
              background
              cornerRadius={10}
            />
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" nameKey="task" />}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
