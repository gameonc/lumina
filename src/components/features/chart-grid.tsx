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
      <div className="flex h-[250px] items-center justify-center text-neutral-500">
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
    <Card>
      <CardHeader>
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      </CardHeader>
      <CardContent>
        <div className="flex h-[250px] items-center justify-center">
          <div className="h-full w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartGrid({ charts, isLoading = false }: ChartGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">
            No charts generated yet
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Upload data to generate automatic visualizations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Auto-Generated Charts
        </h3>
        <span className="text-sm text-neutral-500">
          {charts.length} chart{charts.length !== 1 ? "s" : ""} generated
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {charts.map((chart, index) => {
          const Icon = getChartIcon(chart.type);
          return (
            <Card key={`chart-${index}`} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-primary-500" />
                  {chart.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartRenderer chart={chart} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
