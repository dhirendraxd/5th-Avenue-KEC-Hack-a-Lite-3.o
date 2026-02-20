import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { MonthlyEarnings } from "@/lib/financeData";
import { TrendingUp } from "lucide-react";

interface EarningsChartProps {
  data: MonthlyEarnings[];
  chartType?: "bar" | "line";
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  net: {
    label: "Net Earnings",
    color: "hsl(var(--accent))",
  },
  fees: {
    label: "Platform Fees",
    color: "hsl(var(--muted-foreground))",
  },
};

const EarningsChart = ({ data, chartType = "bar" }: EarningsChartProps) => {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalNet = data.reduce((sum, d) => sum + d.net, 0);
  const growthRate = data.length >= 2 
    ? ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue * 100).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Revenue Overview</CardTitle>
          <div className="flex items-center gap-1 text-sm text-success">
            <TrendingUp className="h-4 w-4" />
            <span>+{growthRate}% growth</span>
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Revenue: </span>
            <span className="font-semibold text-foreground">NPR {totalRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Net Earnings: </span>
            <span className="font-semibold text-accent">NPR {totalNet.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {chartType === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false}
                className="text-muted-foreground text-xs"
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `NPR ${(value / 1000).toFixed(0)}k`}
                className="text-muted-foreground text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `NPR ${Number(value).toLocaleString()}`}
                  />
                }
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false}
                className="text-muted-foreground text-xs"
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `NPR ${(value / 1000).toFixed(0)}k`}
                className="text-muted-foreground text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `NPR ${Number(value).toLocaleString()}`}
                  />
                }
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          )}
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-accent" />
            <span className="text-muted-foreground">Net Earnings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsChart;
