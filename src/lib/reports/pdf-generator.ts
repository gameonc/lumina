/**
 * PDF Report Generator
 *
 * Current Work:
 * - Worker: Auto/Cursor
 * - Task: Generate PDF reports from analysis results
 * - Status: in_progress
 * - Last Updated: 2025-11-22
 */

import type { ChartConfig } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

export interface ReportSection {
  type: "header" | "text" | "chart" | "health_score" | "insights" | "table";
  title?: string;
  content?: string;
  data?: any;
}

export interface ReportConfig {
  title: string;
  subtitle?: string;
  datasetName: string;
  generatedAt: Date;
  sections: ReportSection[];
}

export interface PDFExportOptions {
  format?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
  includeCharts?: boolean;
  includeHealthScore?: boolean;
  includeInsights?: boolean;
}

/**
 * Generate HTML for PDF report
 * Uses Tailwind-like inline styles for PDF compatibility
 */
export function generateReportHTML(
  config: ReportConfig,
  options: PDFExportOptions = {}
): string {
  const {
    includeCharts = true,
    includeHealthScore = true,
    includeInsights = true,
  } = options;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: white;
      padding: 40px;
    }
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 32px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 18px;
      color: #6b7280;
    }
    .meta {
      font-size: 14px;
      color: #9ca3af;
      margin-top: 12px;
    }
    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      border-left: 4px solid #3b82f6;
      padding-left: 12px;
    }
    .section-content {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.8;
    }
    .health-score-card {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      margin: 20px 0;
    }
    .score-display {
      font-size: 48px;
      font-weight: bold;
      text-align: center;
      margin: 16px 0;
    }
    .score-excellent { color: #10b981; }
    .score-good { color: #3b82f6; }
    .score-fair { color: #f59e0b; }
    .score-poor { color: #ef4444; }
    .breakdown {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 20px;
    }
    .breakdown-item {
      background: white;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .breakdown-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
    }
    .breakdown-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .insights-list {
      list-style: none;
      padding: 0;
    }
    .insight-item {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 4px;
    }
    .insight-title {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .chart-placeholder {
      background: #f3f4f6;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      color: #6b7280;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${config.title}</div>
    ${config.subtitle ? `<div class="subtitle">${config.subtitle}</div>` : ""}
    <div class="meta">
      Dataset: ${config.datasetName} | Generated: ${config.generatedAt.toLocaleDateString()} ${config.generatedAt.toLocaleTimeString()}
    </div>
  </div>

  ${config.sections
    .map((section) => {
      if (section.type === "health_score" && includeHealthScore) {
        return generateHealthScoreSection(section);
      } else if (section.type === "chart" && includeCharts) {
        return generateChartSection(section);
      } else if (section.type === "insights" && includeInsights) {
        return generateInsightsSection(section);
      } else if (section.type === "text") {
        return generateTextSection(section);
      } else if (section.type === "table") {
        return generateTableSection(section);
      }
      return "";
    })
    .join("\n")}

  <div class="footer">
    Generated by AI Data Insights Platform
  </div>
</body>
</html>
  `;

  return html;
}

function generateHealthScoreSection(section: ReportSection): string {
  const data = section.data as HealthScoreResult;
  const scoreClass =
    data.score >= 90
      ? "score-excellent"
      : data.score >= 70
        ? "score-good"
        : data.score >= 50
          ? "score-fair"
          : "score-poor";

  return `
    <div class="section">
      <h2 class="section-title">${section.title || "Dataset Health Score"}</h2>
      <div class="health-score-card">
        <div class="score-display ${scoreClass}">${data.score}/100</div>
        <div class="breakdown">
          <div class="breakdown-item">
            <div class="breakdown-label">Completeness</div>
            <div class="breakdown-value">${data.breakdown.completeness}</div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-label">Consistency</div>
            <div class="breakdown-value">${data.breakdown.consistency}</div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-label">Uniqueness</div>
            <div class="breakdown-value">${data.breakdown.uniqueness}</div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-label">Header Quality</div>
            <div class="breakdown-value">${data.breakdown.headerQuality}</div>
          </div>
        </div>
        ${
          data.recommendations.length > 0
            ? `
          <div style="margin-top: 20px;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Recommendations</h3>
            <ul style="list-style: disc; padding-left: 20px;">
              ${data.recommendations.map((rec) => `<li style="margin-bottom: 8px;">${rec}</li>`).join("")}
            </ul>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

function generateChartSection(section: ReportSection): string {
  const chart = section.data as ChartConfig;
  return `
    <div class="section">
      <h2 class="section-title">${section.title || chart.title}</h2>
      <div class="chart-placeholder">
        <strong>${chart.title}</strong><br>
        Type: ${chart.type.toUpperCase()}<br>
        X-Axis: ${chart.xAxis} | Y-Axis: ${chart.yAxis}<br>
        <em>Chart visualization (${chart.data.length} data points)</em>
      </div>
    </div>
  `;
}

function generateInsightsSection(section: ReportSection): string {
  const insights = section.data as Array<{
    title: string;
    description: string;
  }>;
  return `
    <div class="section">
      <h2 class="section-title">${section.title || "Key Insights"}</h2>
      <ul class="insights-list">
        ${insights
          .map(
            (insight) => `
          <li class="insight-item">
            <div class="insight-title">${insight.title}</div>
            <div>${insight.description}</div>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;
}

function generateTextSection(section: ReportSection): string {
  return `
    <div class="section">
      ${section.title ? `<h2 class="section-title">${section.title}</h2>` : ""}
      <div class="section-content">${section.content || ""}</div>
    </div>
  `;
}

function generateTableSection(section: ReportSection): string {
  const data = section.data as { headers: string[]; rows: any[][] };
  return `
    <div class="section">
      ${section.title ? `<h2 class="section-title">${section.title}</h2>` : ""}
      <table>
        <thead>
          <tr>
            ${data.headers.map((h) => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Create a complete report from analysis results
 */
export function createAnalysisReport(
  datasetName: string,
  healthScore: HealthScoreResult,
  charts: ChartConfig[],
  insights: Array<{ title: string; description: string }>
): ReportConfig {
  const sections: ReportSection[] = [
    {
      type: "health_score",
      title: "Dataset Health Score",
      data: healthScore,
    },
  ];

  if (insights.length > 0) {
    sections.push({
      type: "insights",
      title: "Key Insights",
      data: insights,
    });
  }

  if (charts.length > 0) {
    charts.forEach((chart) => {
      sections.push({
        type: "chart",
        title: chart.title,
        data: chart,
      });
    });
  }

  return {
    title: "Data Analysis Report",
    subtitle: "Automated Insights & Visualizations",
    datasetName,
    generatedAt: new Date(),
    sections,
  };
}
