import React, { useEffect } from 'react';
import { Award, Clock, Target, CheckCircle2, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExperimentRunResult } from '../../types/simulation';

interface ExperimentResultsModalProps {
  result: ExperimentRunResult;
  onClose: () => void;
  onRestart: () => void;
  onGoToRecommended?: (simId: string) => void;
}

export const ExperimentResultsModal: React.FC<ExperimentResultsModalProps> = ({
  result,
  onClose,
  onRestart,
  onGoToRecommended,
}) => {
  useEffect(() => {
    if (result.score >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#6366f1', '#f59e0b'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [result.score]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  const getUnderstandingBadge = () => {
    switch (result.conceptUnderstanding) {
      case 'Mastered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Good':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Developing':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-5">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
            <Award className="w-8 h-8" />
          </div>
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            Laboratory Telemetry Logged
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            EXPERIMENT COMPLETE
          </h2>
          <p className="text-xs text-slate-400">
            {result.simulationTitle} ({result.topic})
          </p>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 flex items-center justify-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" /> Score
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              {result.score}%
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Accuracy
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono">
              {result.accuracy}%
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 flex items-center justify-center gap-1">
              <RotateCcw className="w-3 h-3 text-indigo-400" /> Attempts
            </div>
            <div className="text-2xl font-black text-indigo-300 font-mono">
              {result.attemptsCount}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Time
            </div>
            <div className="text-sm font-bold text-amber-300 font-mono mt-1.5">
              {formatTime(result.timeSpentSeconds)}
            </div>
          </div>
        </div>

        {/* Concept Understanding Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
          <span className="text-xs font-semibold text-slate-300">
            Concept Understanding
          </span>
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getUnderstandingBadge()}`}>
            {result.conceptUnderstanding}
          </span>
        </div>

        {/* What went well & Needs Practice */}
        <div className="space-y-3 text-xs">
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 space-y-1.5">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> What you did well
            </span>
            <ul className="space-y-1 text-emerald-200/90 pl-5 list-disc">
              {result.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 space-y-1.5">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" /> Needs practice
            </span>
            <ul className="space-y-1 text-amber-200/90 pl-5 list-disc">
              {result.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Simulation CTA */}
        {result.recommendedSimulationId && onGoToRecommended && (
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-cyan-400 font-semibold block">Personalized Next Step</span>
              <span className="text-slate-300">Ready to advance your knowledge in this track?</span>
            </div>
            <button
              onClick={() => onGoToRecommended(result.recommendedSimulationId!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <span>Next Sim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Repeat Experiment
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
