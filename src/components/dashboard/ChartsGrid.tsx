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
  const ChartIcon = getChartIcon(chart.type);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <ChartIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{chart.title}</h3>
              <p className="text-xs text-slate-500">Click anywhere outside to close</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 transition-colors hover:bg-slate-200"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        
        {/* Chart area */}
        <div className="p-6">
          <div className="h-80 rounded-xl bg-gradient-to-br from-slate-50/50 to-white p-4">
            <ChartRenderer chart={chart} isExpanded={true} />
          </div>
        </div>
        
        {/* Footer with explanation */}
        <div className="border-t border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 px-6 py-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            About this chart
          </h4>
          <p className="text-sm leading-relaxed text-slate-700">
            {chart.explanation || "This visualization helps you understand patterns and trends in your data."}
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
      <div className="group relative flex h-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-lg hover:shadow-slate-200/50">
        {/* Decorative gradient blob */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100/50 to-purple-100/50 blur-2xl transition-opacity group-hover:opacity-80" />
        
        {/* Header */}
        <div className="relative flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
            <ChartIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className="line-clamp-1 flex-1 font-semibold text-slate-900">
            {chart.title}
          </h3>
        </div>

        {/* Chart Area */}
        <div className="relative flex-1 p-4">
          <ChartRenderer chart={chart} isExpanded={false} />
        </div>

        {/* Footer */}
        <div className="relative border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-white px-4 py-3">
          <p className="line-clamp-1 text-xs text-slate-500">
            {chart.explanation?.slice(0, 70) || "Visualization of your data"}...
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            View details
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ChartDetailModal chart={chart} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export function ChartsGrid({ charts, isLoading = false }: ChartsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[340px] animate-pulse rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-100 to-slate-50"
          />
        ))}
      </div>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-12 text-center">
        {/* Decorative gradient blob */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100/30 to-purple-100/30 blur-3xl" />
        
        <div className="relative">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <h3 className="mb-2 font-bold text-slate-900">No charts yet</h3>
          <p className="text-sm text-slate-500">
            Use the AI chat to generate visualizations from your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {charts.map((chart, index) => (
        <ChartCardPremium key={index} chart={chart} />
      ))}
    </div>
  );
}
