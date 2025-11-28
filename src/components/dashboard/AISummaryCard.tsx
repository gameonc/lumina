import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, DollarSign, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import type { HealthScoreResult, HealthIssues } from '@/lib/analyzers/health-score';

interface KeyInsight {
  title: string;
  description: string;
  type: 'money' | 'problem' | 'trend';
}

interface AIInsights {
  keyInsights: KeyInsight[];
}

interface AISummaryCardProps {
  healthScore: HealthScoreResult | null;
  aiInsights: AIInsights | null | undefined;
}

interface FlattenedIssue {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// Helper to flatten HealthIssues into a simple array for display
function flattenIssues(issues: HealthIssues): FlattenedIssue[] {
  const result: FlattenedIssue[] = [];

  // Missing data issues
  issues.missingData.forEach(issue => {
    result.push({
      category: 'Missing Data',
      description: issue.message,
      severity: issue.severity,
    });
  });

  // Anomaly issues
  issues.anomalies.forEach(issue => {
    result.push({
      category: 'Anomalies',
      description: issue.message,
      severity: issue.severity,
    });
  });

  // Bad header issues
  issues.badHeaders.forEach(issue => {
    result.push({
      category: 'Headers',
      description: issue.message,
      severity: issue.severity,
    });
  });

  // Type issues
  issues.typeIssues.forEach(issue => {
    result.push({
      category: 'Data Types',
      description: issue.message,
      severity: issue.severity,
    });
  });

  // Duplication issues
  if (issues.duplication) {
    result.push({
      category: 'Duplicates',
      description: issues.duplication.message,
      severity: issues.duplication.severity,
    });
  }

  // Sort by severity (high first)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  return result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

const getQualityBadge = (score: number) => {
  if (score >= 90) {
    return { label: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
  } else if (score >= 75) {
    return { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  } else if (score >= 60) {
    return { label: 'Fair', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  } else {
    return { label: 'Poor', color: 'bg-red-100 text-red-700 border-red-200' };
  }
};

const getProgressBarColor = (score: number) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-blue-500';
  }
};

const getInsightIcon = (type: KeyInsight['type']) => {
  switch (type) {
    case 'money':
      return <DollarSign className="w-4 h-4 text-green-600" />;
    case 'problem':
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    case 'trend':
      return <TrendingUp className="w-4 h-4 text-blue-600" />;
  }
};

const getInsightColor = (type: KeyInsight['type']) => {
  switch (type) {
    case 'money':
      return 'text-green-700';
    case 'problem':
      return 'text-amber-700';
    case 'trend':
      return 'text-blue-700';
  }
};

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ healthScore, aiInsights }) => {
  const hasData = healthScore || aiInsights;
  const qualityBadge = healthScore ? getQualityBadge(healthScore.score) : null;
  const flattenedIssues = healthScore ? flattenIssues(healthScore.issues) : [];

  if (!hasData) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-semibold text-gray-900">AI Summary</h2>
        </div>
        <p className="text-gray-500 text-center py-8">
          Upload data to see AI-powered insights and recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-semibold text-gray-900">AI Summary</h2>
      </div>

      <div className="space-y-8">
        {/* Data Quality Section */}
        {healthScore && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Data Quality</h3>
            </div>

            <div className="space-y-4">
              {/* Score and Badge */}
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-gray-900">
                  {healthScore.score}
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
                {qualityBadge && (
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${qualityBadge.color}`}>
                    {qualityBadge.label}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${getProgressBarColor(healthScore.score)}`}
                  style={{ width: `${healthScore.score}%` }}
                />
              </div>

              {/* Issues */}
              {flattenedIssues.length > 0 && (
                <div className="mt-4 space-y-2">
                  {flattenedIssues.slice(0, 3).map((issue, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getSeverityColor(issue.severity)}`} />
                      <span className="text-gray-700">
                        <span className="font-medium">{issue.category}:</span> {issue.description}
                      </span>
                    </div>
                  ))}
                  {flattenedIssues.length > 3 && (
                    <p className="text-sm text-gray-500 ml-6">
                      +{flattenedIssues.length - 3} more issue{flattenedIssues.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Insights Section */}
        {aiInsights?.keyInsights && aiInsights.keyInsights.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
            </div>

            <ul className="space-y-3">
              {aiInsights.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${getInsightColor(insight.type)}`}>
                      {insight.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {insight.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations Section */}
        {aiInsights?.keyInsights && aiInsights.keyInsights.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
            </div>

            <ul className="space-y-3">
              {aiInsights.keyInsights
                .filter(insight => insight.type === 'money' || insight.type === 'trend')
                .slice(0, 3)
                .map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">
                      {insight.type === 'money'
                        ? `Focus on ${insight.title.toLowerCase()} to maximize value`
                        : `Monitor ${insight.title.toLowerCase()} for optimization opportunities`}
                    </p>
                  </li>
                ))}
              {aiInsights.keyInsights.some(i => i.type === 'problem') && (
                <li className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">
                    Address identified issues to improve data quality and reliability
                  </p>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* View Full Analysis Link */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors group">
          <span>View full analysis</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
