"use client";

import { useState } from "react";
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
  X,
} from "lucide-react";
import type { ChartConfig } from "@/types";

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

// Process pie data: group small slices into "Other" if > MAX_SLICES
const MAX_SLICES = 6;

interface PieDataItem {
  [key: string]: unknown;
  value: number;
}

function processPieData(data: PieDataItem[], nameKey: string): PieDataItem[] {
  if (data.length <= MAX_SLICES) return data;

  // Sort by value descending
  const sorted = [...data].sort((a, b) => (b.value as number) - (a.value as number));

  // Keep top N-1, combine rest into "Other"
  const topSlices = sorted.slice(0, MAX_SLICES - 1);
  const otherSlices = sorted.slice(MAX_SLICES - 1);

  const otherTotal = otherSlices.reduce((sum, item) => sum + (item.value as number), 0);

  if (otherTotal > 0) {
    topSlices.push({
      [nameKey]: "Other",
      value: otherTotal,
    } as PieDataItem);
  }

  return topSlices;
}

// Custom tooltip for pie charts
interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: PieDataItem;
  }>;
  total: number;
}

function CustomPieTooltip({ active, payload, total }: PieTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const percentage = ((data.value / total) * 100).toFixed(1);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-sm font-medium text-slate-900">{data.name}</p>
      <p className="text-sm text-slate-600">
        Value: <span className="font-semibold">{data.value.toLocaleString()}</span>
      </p>
      <p className="text-sm text-slate-600">
        Share: <span className="font-semibold">{percentage}%</span>
      </p>
    </div>
  );
}

// Compact Donut Chart for Card View
function CompactDonutChart({
  data,
  nameKey,
  colors = CHART_COLORS
}: {
  data: PieDataItem[];
  nameKey: string;
  colors?: string[];
}) {
  const processedData = processPieData(data, nameKey);
  const total = processedData.reduce((sum, d) => sum + (d.value as number), 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={processedData}
          dataKey="value"
          nameKey={nameKey}
          cx="50%"
          cy="45%"
          innerRadius={35}
          outerRadius={65}
          paddingAngle={2}
          label={false}
          labelLine={false}
        >
          {processedData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip total={total} />} />
        <Legend
          verticalAlign="bottom"
          height={50}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            paddingTop: '8px',
            fontSize: '11px',
          }}
          formatter={(value: string) => {
            const str = String(value);
            return (
              <span className="text-slate-600">
                {str.length > 12 ? `${str.slice(0, 12)}...` : str}
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Expanded Donut Chart for Modal View
function ExpandedDonutChart({
  data,
  nameKey,
  colors = CHART_COLORS
}: {
  data: PieDataItem[];
  nameKey: string;
  colors?: string[];
}) {
  const processedData = processPieData(data, nameKey);
  const total = processedData.reduce((sum, d) => sum + (d.value as number), 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={processedData}
          dataKey="value"
          nameKey={nameKey}
          cx="35%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {processedData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip total={total} />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={10}
          wrapperStyle={{
            paddingLeft: '20px',
            right: 0,
            width: '45%',
          }}
          formatter={(value: string) => {
            const item = processedData.find(d => d[nameKey] === value);
            const itemValue = item?.value || 0;
            const percentage = ((itemValue / total) * 100).toFixed(1);
            return (
              <span
                className="text-slate-700"
                style={{
                  display: 'inline-block',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  maxWidth: '150px',
                }}
              >
                {value} ({percentage}%)
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ChartRenderer({ chart, isExpanded = false }: { chart: ChartConfig; isExpanded?: boolean }) {
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
          <LineChart {...commonProps} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xAxis}
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(value) => {
                const str = String(value);
                return str.length > 12 ? `${str.slice(0, 12)}...` : str;
              }}
            />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
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
          <BarChart {...commonProps} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xAxis}
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(value) => {
                const str = String(value);
                return str.length > 12 ? `${str.slice(0, 12)}...` : str;
              }}
            />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
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
      // Use different chart based on card vs modal view
      if (isExpanded) {
        return (
          <ExpandedDonutChart
            data={data as PieDataItem[]}
            nameKey={xAxis || "name"}
            colors={colors}
          />
        );
      }
      return (
        <CompactDonutChart
          data={data as PieDataItem[]}
          nameKey={xAxis || "name"}
          colors={colors}
        />
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

function ChartDetailModal({
  chart,
  onClose,
}: {
  chart: ChartConfig;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="mb-4 text-lg font-semibold">{chart.title}</h3>
        {/* Larger chart area for modal */}
        <div className="mb-4 h-80">
          <ChartRenderer chart={chart} isExpanded={true} />
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-slate-700">About this chart</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {chart.explanation || "No additional details available."}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChartCardPremium({ chart }: { chart: ChartConfig }) {
  const [showModal, setShowModal] = useState(false);
  const ChartIcon = getChartIcon(chart.type);

  return (
    <>
      <div className="flex h-[320px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <ChartIcon className="h-4 w-4 text-slate-500" />
            <h3 className="line-clamp-1 text-sm font-medium text-slate-900">
              {chart.title}
            </h3>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 p-4">
          <ChartRenderer chart={chart} isExpanded={false} />
        </div>

        {/* Footer - 1 sentence + More details */}
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="line-clamp-1 text-xs text-slate-500">
            {chart.explanation?.slice(0, 80) || "Visualization of your data"}
            ...
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            More details →
          </button>
        </div>
      </div>

      {/* Modal for full explanation */}
      {showModal && (
        <ChartDetailModal chart={chart} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export function ChartsGrid({ charts, isLoading = false }: ChartsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <BarChart3 className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="mb-1 text-sm font-medium text-slate-700">No charts yet</h3>
        <p className="text-sm text-slate-500">
          Use the AI chat to generate visualizations from your data
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {charts.map((chart, index) => (
        <ChartCardPremium key={index} chart={chart} />
      ))}
    </div>
  );
}
