import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Layers,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import { storageService } from '../../storage/localStorage';
import { computeAnalyticsSummary } from '../../analytics/engine';
import { generateRecommendations } from '../../analytics/recommendations';
import { Recommendation } from '../../types/analytics';

interface RecommendationsViewProps {
  onNavigateToSim: (simId: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ onNavigateToSim }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const logs = storageService.getLogs();
    const summary = computeAnalyticsSummary(logs);
    const recs = generateRecommendations(logs, summary.topicMetrics);
    setRecommendations(recs);
  }, []);

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Low':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              Personalized Learning Pathways
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              DETERMINISTIC DATA ENGINE
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Rule-based suggestions derived from your accuracy rates, mistake patterns, and curriculum prerequisite trees.
          </p>
        </div>
      </div>

      {/* Suggested Actions List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
          Recommended Next Experiments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${getPriorityBadge(rec.priority)}`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {rec.triggerMetric}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {rec.simulationTitle}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400/90 mt-0.5">
                    {rec.topic}
                  </div>
                </div>

                {/* Deterministic Explanation Reason */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-500 block font-mono text-[10px] uppercase mb-1">
                    Telemetry Deduction Reason:
                  </span>
                  {rec.reason}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onNavigateToSim(rec.simulationId)}
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                <span>Launch Recommended Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* STEM Learning Trees / Prerequisite Chains */}
      <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <span>Curriculum Prerequisite Trees</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Math Track */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <span className="font-bold text-indigo-400 uppercase tracking-wider block">
              Mathematics Track
            </span>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>1. Linear Equations (y=mx+c)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>2. Quadratic Functions</span>
                <span className="text-[10px] text-cyan-400 font-mono">Current</span>
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between opacity-60">
                <span>3. Calculus Derivatives &amp; Limits</span>
                <span className="text-[10px] text-slate-500 font-mono">Next</span>
              </div>
            </div>
          </div>

          {/* Physics Track */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block">
              Physics Track
            </span>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>1. Projectile Ballistics</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>2. Harmonic Pendulum</span>
                <span className="text-[10px] text-cyan-400 font-mono">Current</span>
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between opacity-60">
                <span>3. Hooke's Spring &amp; Wave Interference</span>
                <span className="text-[10px] text-slate-500 font-mono">Next</span>
              </div>
            </div>
          </div>

          {/* Chemistry Track */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <span className="font-bold text-emerald-400 uppercase tracking-wider block">
              Chemistry Track
            </span>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>1. Periodic Trends &amp; Elements</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>2. Bohr Quantized Energy Levels</span>
                <span className="text-[10px] text-cyan-400 font-mono">Current</span>
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between opacity-60">
                <span>3. Collision Theory &amp; Catalysts</span>
                <span className="text-[10px] text-slate-500 font-mono">Next</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
