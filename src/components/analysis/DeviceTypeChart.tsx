
// ========================================
// src/components/analysis/DeviceTypeChart.tsx
// ========================================

import { LabelList, Pie, PieChart } from "recharts";

import {
  Card as CardDev,
  CardContent as CardContentDev,
  CardFooter as CardFooterDev,
  CardHeader as CardHeaderDev,
  CardTitle as CardTitleDev,
} from "@/components/ui/card";
import type {
  ChartConfig as ChartConfigDev,
} from "@/components/ui/chart";
import {
  ChartContainer as ChartContainerDev,
  ChartTooltip as ChartTooltipDev,
  ChartTooltipContent as ChartTooltipContentDev,
} from "@/components/ui/chart";
import { useWiFiData as useWiFiDataDev } from "@/context/WiFiDataContext";
import { getDeviceTypeDistribution } from "@/utils/analysisUtils";

const deviceChartConfig = {
  visitors: {
    label: "Visitors",
  },
  router: {
    label: "Router",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfigDev;

export function DeviceTypeChart() {
  const { wifiData, loading } = useWiFiDataDev()
  const chartData = React.useMemo(() => {
    if (loading || !wifiData.length) return []
    return getDeviceTypeDistribution(wifiData)
  }, [wifiData, loading])

  const totalVisitors = chartData.reduce((acc, curr) => acc + curr.visitors, 0)

  if (loading) return <CardDev className="flex flex-col"><CardContentDev className="p-6">Loading...</CardContentDev></CardDev>

  return (
    <CardDev className="flex flex-col">
      <CardHeaderDev className="items-center pb-0 border-b">
        <CardTitleDev>Device Type Distribution</CardTitleDev>
      </CardHeaderDev>
      <CardContentDev className="flex-1 pb-0">
        <ChartContainerDev
          config={deviceChartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltipDev
              content={<ChartTooltipContentDev nameKey="visitors" hideLabel />}
            />
            <Pie data={chartData} dataKey="visitors">
              <LabelList
                dataKey="browser"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: string) => {
                  return value.charAt(0).toUpperCase() + value.slice(1);
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainerDev>
      </CardContentDev>
      <CardFooterDev className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-6 leading-none font-medium">
          {chartData.map((item, idx) => {
            const percent = totalVisitors > 0 ? ((item.visitors / totalVisitors) * 100).toFixed(1) : "0"
            return (
              <div key={item.browser} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-chart-${idx + 1}`}></div>
                {item.browser.charAt(0).toUpperCase() + item.browser.slice(1)}: {percent}%
              </div>
            )
          })}
        </div>
      </CardFooterDev>
    </CardDev>
  )
}