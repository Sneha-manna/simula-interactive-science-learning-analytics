import React from 'react';
import { BookOpen, HelpCircle, ArrowRightCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { SimulationMetadata } from '../../types/simulation';

interface TheoryPanelProps {
  metadata: SimulationMetadata;
}

export const TheoryPanel: React.FC<TheoryPanelProps> = ({ metadata }) => {
  const { explanation, learningObjectives, prerequisites, formula } = {
    explanation: metadata.explanation,
    learningObjectives: metadata.learningObjectives,
    prerequisites: metadata.prerequisites,
    formula: metadata.explanation.formula,
  };

  return (
    <div className="space-y-6">
      {/* Learning Objectives */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Core Learning Objectives
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {learningObjectives.map((obj, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{obj}</span>
            </li>
          ))}
        </ul>

        {prerequisites && prerequisites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Prerequisites:</span>
            {prerequisites.join(' • ')}
          </div>
        )}
      </div>

      {/* Structured 6-Part Educational Explanation (Rule 23) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> 1. What is the Concept?
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{explanation.concept}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> 2. What are we changing?
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{explanation.whatWeChange}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
            <ArrowRightCircle className="w-3.5 h-3.5" /> 3. What happens?
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{explanation.whatHappens}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 4. Why does it happen?
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{explanation.whyItHappens}</p>
        </div>
      </div>

      {/* Governing Formula */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-cyan-500/20 rounded-2xl p-5 shadow-lg">
        <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
          5. Governing Mathematical &amp; Scientific Law
        </div>
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-cyan-300 text-sm md:text-base tracking-wide flex items-center justify-center">
          {formula}
        </div>
      </div>

      {/* Takeaway */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 text-sm text-emerald-200 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <span className="font-bold text-emerald-400 block mb-1">6. Key Takeaway &amp; Real-World Application</span>
          {explanation.takeaway}
        </div>
      </div>
    </div>
  );
};
