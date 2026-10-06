import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Award,
  Clock,
  Target,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Brain,
  Layers,
  Sparkles,
  RefreshCw,
  Database,
} from 'lucide-react';
import { storageService } from '../../storage/localStorage';
import { computeAnalyticsSummary } from '../../analytics/engine';
import { AnalyticsSummary, ExperimentLog } from '../../types/analytics';
import { INITIAL_EXPERIMENT_LOGS } from '../../storage/seedData';

interface AnalyticsDashboardProps {
  onNavigateToSim: (simId: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onNavigateToSim }) => {
  const [logs, setLogs] = useState<ExperimentLog[]>(storageService.getLogs());
  const [summary, setSummary] = useState<AnalyticsSummary>(computeAnalyticsSummary(logs));

  // Refresh whenever storage changes
  const refreshData = () => {
    const updated = storageService.getLogs();
    setLogs(updated);
    setSummary(computeAnalyticsSummary(updated));
  };

  useEffect(() => {
    return storageService.subscribe(refreshData);
  }, []);

  const handleResetToSeed = () => {
    storageService.saveLogs(INITIAL_EXPERIMENT_LOGS);
    refreshData();
  };

  const handleClearLogs = () => {
    storageService.saveLogs([]);
    refreshData();
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // Recharts custom dark tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Score') || entry.name.includes('Accuracy') || entry.name.includes('Mastery') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prepare radar data for subject mastery
  const radarData = [
    { subject: 'Mathematics', mastery: summary.subjectBreakdown.mathematics?.averageAccuracy ?? 0, fullMark: 100 },
    { subject: 'Physics', mastery: summary.subjectBreakdown.physics?.averageAccuracy ?? 0, fullMark: 100 },
    { subject: 'Chemistry', mastery: summary.subjectBreakdown.chemistry?.averageAccuracy ?? 0, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto">
      {/* Header & Telemetry Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              Student Learning Analytics
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              LOCAL TELEMETRY
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Real-time computation of experiment completions, parametric trials, accuracy trends, and topic mastery.
          </p>
        </div>

        {/* Data Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToSeed}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
            title="Load standard student benchmark history"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Sample Data</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
            title="Clear all stored logs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase tracking-wider">
            <span>Completed Labs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-100">
            {summary.totalSimulationsRun}
          </div>
          <div className="text-[11px] text-slate-400">
            Total recorded sessions: {logs.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase tracking-wider">
            <span>Avg Accuracy</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-300">
            {summary.overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400">
            Avg Score: {summary.overallLearningScore}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase tracking-wider">
            <span>Time In Labs</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {formatTime(summary.totalTimeMinutes)}
          </div>
          <div className="text-[11px] text-slate-400">
            Dedicated laboratory study
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase tracking-wider">
            <span>Exploration Ratio</span>
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-300">
            {(logs.length / Math.max(1, summary.totalSimulationsRun)).toFixed(1)}x
          </div>
          <div className="text-[11px] text-slate-400">
            Runs per unique simulation
          </div>
        </div>
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Historical Performance Trend */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Accuracy &amp; Score Progression</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sequential assessment performance across consecutive experiment runs
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {summary.accuracyTrend && summary.accuracyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" name="Score" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Complete simulations to plot your progression trend
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Subject Mastery Radar */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>STEM Mastery Distribution</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cross-disciplinary proficiency balance across Math, Physics, and Chemistry
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                <Radar name="Accuracy %" dataKey="mastery" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Strengths */}
        <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Conceptual Strengths</span>
          </div>

          <div className="space-y-2">
            {summary.strongTopics && summary.strongTopics.length > 0 ? (
              summary.strongTopics.map((str, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/60 rounded-xl border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed"
                >
                  • {str}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">Complete more simulations with &gt;75% accuracy to identify strengths.</div>
            )}
          </div>
        </div>

        {/* Identified Gaps / Needs Practice */}
        <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/20 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Targeted Learning Gaps &amp; Practice Areas</span>
          </div>

          <div className="space-y-2">
            {summary.weakTopics && summary.weakTopics.length > 0 ? (
              summary.weakTopics.map((weak, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/60 rounded-xl border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed"
                >
                  • {weak}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No critical learning gaps identified. Outstanding consistency!</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Experiment History Log Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">
            Laboratory Telemetry Log History
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {logs.length} Recorded Runs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Simulation</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.slice().reverse().slice(0, 10).map((log, index) => (
                <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-3 text-slate-200 font-bold font-sans">
                    {log.simulationTitle}
                  </td>
                  <td className="py-3 px-3">
                    <span className="capitalize text-slate-400">{log.subject}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-cyan-300">
                    {log.score}%
                  </td>
                  <td className="py-3 px-3">
                    <span className={log.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                      {log.accuracy}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {formatTime(log.durationSeconds)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigateToSim(log.simulationId)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded-lg text-[11px] transition-colors"
                    >
                      Re-run Lab
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
