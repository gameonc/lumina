import pptxgen from "pptxgenjs";
import type { ChartConfig } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface PowerPointData {
  datasetName: string;
  charts: ChartConfig[];
  healthScore: HealthScoreResult | null;
  datasetType: string;
  rowCount: number;
  columnCount: number;
}

export async function generatePowerPoint(data: PowerPointData): Promise<Blob> {
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "AI Data Insights";
  pptx.title = data.datasetName;
  pptx.subject = "Data Analysis Report";

  // Slide 1: Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "F8FAFC" };
  
  titleSlide.addText(data.datasetName, {
    x: 1,
    y: 2,
    w: 11,
    h: 1.5,
    fontSize: 44,
    bold: true,
    align: "center",
    color: "1E293B",
  });

  titleSlide.addText(`${data.datasetType.toUpperCase()} ANALYSIS REPORT`, {
    x: 1,
    y: 3.5,
    w: 11,
    h: 0.5,
    fontSize: 20,
    align: "center",
    color: "64748B",
  });

  titleSlide.addText(`${data.rowCount.toLocaleString()} rows • ${data.columnCount} columns`, {
    x: 1,
    y: 4.2,
    w: 11,
    h: 0.4,
    fontSize: 14,
    align: "center",
    color: "94A3B8",
  });

  // Slide 2: Executive Summary (Health Score)
  if (data.healthScore) {
    const summarySlide = pptx.addSlide();
    summarySlide.background = { color: "FFFFFF" };

    summarySlide.addText("Data Quality Overview", {
      x: 0.5,
      y: 0.5,
      w: 12,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: "1E293B",
    });

    // Health Score - Large display
    const scoreColor = data.healthScore.score >= 80 ? "10B981" : 
                       data.healthScore.score >= 60 ? "F59E0B" : "EF4444";
    
    summarySlide.addText(`${data.healthScore.score}`, {
      x: 1,
      y: 1.5,
      w: 2,
      h: 1.5,
      fontSize: 72,
      bold: true,
      color: scoreColor,
      align: "center",
    });

    summarySlide.addText("/ 100", {
      x: 3,
      y: 2.3,
      w: 1,
      h: 0.5,
      fontSize: 24,
      color: "94A3B8",
    });

    summarySlide.addText("Health Score", {
      x: 1,
      y: 3,
      w: 3,
      h: 0.4,
      fontSize: 16,
      color: "64748B",
      align: "center",
    });

    // Breakdown metrics (with null checks)
    const breakdown = data.healthScore.breakdown || {};
    const metrics = [
      { label: "Completeness", value: breakdown.completeness ?? 0 },
      { label: "Uniqueness", value: breakdown.uniqueness ?? 0 },
      { label: "Consistency", value: breakdown.consistency ?? 0 },
      { label: "Header Quality", value: breakdown.headerQuality ?? 0 },
    ];

    metrics.forEach((metric, i) => {
      const yPos = 1.5 + (i * 0.6);
      summarySlide.addText(metric.label, {
        x: 5,
        y: yPos,
        w: 3,
        h: 0.4,
        fontSize: 14,
        color: "475569",
      });

      summarySlide.addText(`${metric.value}%`, {
        x: 8.5,
        y: yPos,
        w: 1,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: metric.value >= 80 ? "10B981" : metric.value >= 60 ? "F59E0B" : "EF4444",
        align: "right",
      });
    });

    // Key Recommendations
    const recommendations = data.healthScore.recommendations || [];
    if (recommendations.length > 0) {
      summarySlide.addText("Key Recommendations", {
        x: 0.5,
        y: 4,
        w: 12,
        h: 0.5,
        fontSize: 20,
        bold: true,
        color: "1E293B",
      });

      recommendations.slice(0, 3).forEach((rec, i) => {
        summarySlide.addText(`${i + 1}. ${rec}`, {
          x: 0.7,
          y: 4.6 + (i * 0.5),
          w: 11.5,
          h: 0.4,
          fontSize: 14,
          color: "475569",
          bullet: false,
        });
      });
    }
  }

  // Slides 3-7: Charts
  const validCharts = Array.isArray(data.charts) ? data.charts.slice(0, 5) : [];
  
  validCharts.forEach((chart, index) => {
    const chartSlide = pptx.addSlide();
    chartSlide.background = { color: "FFFFFF" };

    chartSlide.addText(chart.title || `Chart ${index + 1}`, {
      x: 0.5,
      y: 0.5,
      w: 12,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "1E293B",
    });

    try {
      // Convert chart data to PowerPoint format
      if (chart.data && chart.data.length > 0) {
        if (chart.type === "bar" && chart.xAxis && chart.yAxis) {
          const chartData = [
            {
              name: chart.yAxis as string,
              labels: chart.data.map((item: any) => String(item[chart.xAxis as string]).substring(0, 20)),
              values: chart.data.map((item: any) => Number(item[chart.yAxis as string]) || 0),
            },
          ];

          chartSlide.addChart(pptx.ChartType.bar, chartData, {
            x: 1,
            y: 1.5,
            w: 11,
            h: 4.5,
            showTitle: false,
            showLegend: true,
            legendPos: "b",
            barDir: "col",
            chartColors: ["3B82F6"],
          });
        } else if (chart.type === "line" && chart.xAxis && chart.yAxis) {
          const chartData = [
            {
              name: chart.yAxis as string,
              labels: chart.data.map((item: any) => String(item[chart.xAxis as string]).substring(0, 20)),
              values: chart.data.map((item: any) => Number(item[chart.yAxis as string]) || 0),
            },
          ];

          chartSlide.addChart(pptx.ChartType.line, chartData, {
            x: 1,
            y: 1.5,
            w: 11,
            h: 4.5,
            showTitle: false,
            showLegend: true,
            legendPos: "b",
            chartColors: ["3B82F6"],
          });
        } else if (chart.type === "pie" && chart.xAxis) {
          const chartData = chart.data.slice(0, 8).map((item: any) => ({
            name: String(item[chart.xAxis as string]).substring(0, 20),
            labels: [String(item[chart.xAxis as string]).substring(0, 20)],
            values: [Number(item.value) || 0],
          }));

          chartSlide.addChart(pptx.ChartType.pie, chartData, {
            x: 2,
            y: 1.5,
            w: 9,
            h: 4.5,
            showTitle: false,
            showLegend: true,
            legendPos: "r",
            chartColors: ["3B82F6", "10B981", "F59E0B", "EF4444", "8B5CF6", "EC4899", "06B6D4", "84CC16"],
          });
        } else {
          // Fallback for unsupported chart types
          chartSlide.addText("Chart preview not available in PowerPoint export", {
            x: 3,
            y: 3.5,
            w: 7,
            h: 1,
            fontSize: 16,
            color: "94A3B8",
            align: "center",
          });
        }
      }
    } catch (error) {
      console.error("Error adding chart to slide:", error);
      chartSlide.addText("Chart could not be rendered", {
        x: 3,
        y: 3.5,
        w: 7,
        h: 1,
        fontSize: 16,
        color: "EF4444",
        align: "center",
      });
    }
  });

  // Final Slide: Thank You
  const finalSlide = pptx.addSlide();
  finalSlide.background = { color: "F8FAFC" };

  finalSlide.addText("Thank You", {
    x: 1,
    y: 2.5,
    w: 11,
    h: 1,
    fontSize: 44,
    bold: true,
    align: "center",
    color: "1E293B",
  });

  finalSlide.addText("Generated by AI Data Insights", {
    x: 1,
    y: 3.8,
    w: 11,
    h: 0.5,
    fontSize: 16,
    align: "center",
    color: "94A3B8",
  });

  // Generate and return as Blob
  const uint8Array = await pptx.write({ outputType: "arraybuffer" }) as ArrayBuffer;
  return new Blob([uint8Array], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
}

