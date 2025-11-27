"use client";

interface DataQualityBadgeProps {
  score: number;
}

export function DataQualityBadge({ score }: DataQualityBadgeProps) {
  const getQualityLevel = (score: number) => {
    if (score >= 90) {
      return {
        label: "Excellent",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-700",
      };
    } else if (score >= 75) {
      return {
        label: "Good",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
      };
    } else if (score >= 60) {
      return {
        label: "Fair",
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
      };
    } else {
      return {
        label: "Poor",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
      };
    }
  };

  const quality = getQualityLevel(score);

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${quality.bgColor} ${quality.textColor}`}
    >
      {quality.label}
    </span>
  );
}
