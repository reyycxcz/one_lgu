"use client"

import * as React from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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
  { category: "Reports", score: 92 },
  { category: "Documents", score: 85 },
  { category: "Certifications", score: 78 },
  { category: "Complaints", score: 88 },
  { category: "Announcements", score: 95 },
  { category: "Compliance", score: 87 },
]

const chartConfig = {
  score: {
    label: "Performance Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartRadarDots() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Barangay Performance</CardTitle>
        <CardDescription>
          Performance metrics across categories
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <PolarGrid
              className="fill-[hsl(var(--chart-1))]/10"
              stroke="hsl(var(--border))"
            />
            <PolarAngleAxis dataKey="category" />
            <Radar
              dataKey="score"
              stroke="var(--color-score)"
              strokeWidth={2}
              fill="var(--color-score)"
              fillOpacity={0.3}
              dot={{
                r: 4,
                fill: "var(--color-score)",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
