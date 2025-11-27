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
import {
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Activity,
} from "lucide-react";
import type { ChartConfig } from "@/types";
import { ChartCard, ChartCardSkeleton } from "./ChartCard";

interface ChartsGridProps {
  charts: ChartConfig[];
  isLoading?: boolean;
}

const CHART_COLORS = [
  "#6366F1", // indigo
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
      return Activity;
    default:
      return BarChart3;
  }
}

function ChartRenderer({ chart }: { chart: ChartConfig }) {
  const { type, data, xAxis, yAxis, colors = CHART_COLORS } = chart;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey={type === "histogram" ? "frequency" : (yAxis as string)}
              fill={colors[0]}
              radius={[6, 6, 0, 0]}
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
        <ResponsiveContainer width="100%" height="100%">
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
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height="100%">
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
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Scatter name={chart.title} data={data} fill={colors[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <div className="flex h-full items-center justify-center text-slate-500">
          Unsupported chart type: {type}
        </div>
      );
  }
}

export function ChartsGrid({ charts, isLoading = false }: ChartsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <ChartCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Always show placeholders if no charts - NEVER show empty state
  if (!charts || charts.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-2">
                <BarChart3 className="h-5 w-5 text-indigo-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">
                  Chart {i}
                </h3>
                <p className="text-xs text-slate-500">
                  Generating visualization...
                </p>
              </div>
            </div>
            <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <p className="text-sm font-medium text-slate-600">
                  Analyzing data...
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Ask AI to generate charts
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {charts.map((chart, index) => {
        const Icon = getChartIcon(chart.type);
        return (
          <ChartCard
            key={`chart-${index}`}
            title={chart.title}
            icon={Icon}
            explanation={chart.explanation}
          >
            <ChartRenderer chart={chart} />
          </ChartCard>
        );
      })}
    </div>
  );
}
