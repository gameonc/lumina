"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ChartConfig } from "@/types";
import { TrendingUp, BarChart3, PieChartIcon, ScatterChartIcon } from "lucide-react";

interface ChartGridProps {
  charts: ChartConfig[];
  isLoading?: boolean;
}

const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

function getChartIcon(type: string) {
  switch (type) {
    case "line":
    case "area":
      return TrendingUp;
    case "bar":
    case "histogram":
      return BarChart3;
    case "pie":
      return PieChartIcon;
    case "scatter":
      return ScatterChartIcon;
    default:
      return BarChart3;
  }
}

function ChartRenderer({ chart }: { chart: ChartConfig }) {
  const { type, data, xAxis, yAxis, colors = CHART_COLORS } = chart;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] sm:h-[250px] items-center justify-center text-neutral-500 text-sm">
        No data available
      </div>
    );
  }

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  switch (type) {
    case "line":
    case "area":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xAxis}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={yAxis as string}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
    case "histogram":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xAxis}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey={type === "histogram" ? "frequency" : (yAxis as string)}
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey={xAxis}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xAxis}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              name={xAxis}
            />
            <YAxis
              dataKey={yAxis as string}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              name={yAxis as string}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Scatter name={chart.title} data={data} fill={colors[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <div className="flex h-[250px] items-center justify-center text-neutral-500">
          Unsupported chart type: {type}
        </div>
      );
  }
}

function ChartSkeleton() {
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
      </CardHeader>
      <CardContent>
        <div className="flex h-[250px] items-center justify-center">
          <div className="h-full w-full animate-pulse rounded bg-slate-100" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartGrid({ charts, isLoading = false }: ChartGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300" />
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-500">
            No charts generated yet
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload data to generate automatic visualizations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {charts.map((chart, index) => {
          const Icon = getChartIcon(chart.type);
          return (
            <Card key={`chart-${index}`} className="overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2 bg-slate-50/50 border-b border-slate-100/50">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-slate-800">
                  <Icon className="h-4 w-4 text-violet-500 flex-shrink-0" />
                  <span className="truncate font-medium">{chart.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4">
                <ChartRenderer chart={chart} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
