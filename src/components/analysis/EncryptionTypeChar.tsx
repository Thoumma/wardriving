"use client"

import { Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

export const description = "A donut chart with an active sector"

const chartData = [
  { browser: "CCMP", visitors: 275, fill: "var(--color-CCMP)" },
  { browser: "TKIP", visitors: 200, fill: "var(--color-TKIP)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  CCMP: {
    label: "CCMP",
    color: "var(--chart-1)",
  },
  TKIP: {
    label: "TKIP",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function EncryptionTypeChart() {
  const totalVisitors = chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  const ccmpPercent = ((chartData.find(d => d.browser === "CCMP")?.visitors || 0) / totalVisitors * 100).toFixed(1);
  const tkipPercent = ((chartData.find(d => d.browser === "TKIP")?.visitors || 0) / totalVisitors * 100).toFixed(1);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0 border-b">
        <CardTitle>Encryption Type</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-6 leading-none font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1"></div>
            CCMP: {ccmpPercent}%
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2"></div>
            TKIP: {tkipPercent}%
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}