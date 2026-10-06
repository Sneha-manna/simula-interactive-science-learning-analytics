import React, { useState } from 'react';
import {
  Search,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Atom,
  Binary,
  FlaskConical,
} from 'lucide-react';
import { SIMULATION_REGISTRY } from '../../simulations/registry';
import { SimulationMetadata, Subject } from '../../types/simulation';
import { storageService } from '../../storage/localStorage';

interface LibraryViewProps {
  onSelectSimulation: (simId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onSelectSimulation }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'roadmap'>('all');

  const completedLogs = storageService.getLogs();
  const completedMap = new Map<string, number>();
  completedLogs.forEach((log) => {
    const existing = completedMap.get(log.simulationId) || 0;
    if (log.score > existing) completedMap.set(log.simulationId, log.score);
  });

  const filteredSimulations = SIMULATION_REGISTRY.filter((sim) => {
    // Subject filter
    if (selectedSubject !== 'all' && sim.subject !== selectedSubject) return false;
    // Difficulty filter
    if (selectedDifficulty !== 'all' && sim.difficulty !== selectedDifficulty) return false;
    // Status filter
    if (filterType === 'active' && !sim.isImplemented) return false;
    if (filterType === 'roadmap' && sim.isImplemented) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = sim.title.toLowerCase().includes(q);
      const matchTopic = sim.topic.toLowerCase().includes(q);
      const matchDesc = sim.description.toLowerCase().includes(q);
      if (!matchTitle && !matchTopic && !matchDesc) return false;
    }
    return true;
  });

  const getSubjectBadge = (subj: Subject) => {
    switch (subj) {
      case 'mathematics':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'physics':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'chemistry':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getSubjectIcon = (subj: Subject) => {
    switch (subj) {
      case 'mathematics':
        return <Binary className="w-3.5 h-3.5" />;
      case 'physics':
        return <Atom className="w-3.5 h-3.5" />;
      case 'chemistry':
        return <FlaskConical className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
            Simulation Library
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Browse our modular catalog of STEM simulations. Active labs are fully functional with mathematical physics engines.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            10 Active Labs
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            150+ Modular Architecture
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['all', 'mathematics', 'physics', 'chemistry'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                  selectedSubject === s
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s === 'all' ? 'All Disciplines' : s}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search simulations or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Secondary Filter Row: Difficulty & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
          {/* Difficulty Selection */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Difficulty:</span>
            {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff === 'all' ? 'Any' : diff}
              </button>
            ))}
          </div>

          {/* Status Selection */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Status:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-800 text-slate-200 border-slate-700 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                filterType === 'active'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Labs (10)
            </button>
            <button
              onClick={() => setFilterType('roadmap')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                filterType === 'roadmap'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Roadmap (150+)
            </button>
          </div>
        </div>
      </div>

      {/* Simulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSimulations.map((sim) => {
          const highestScore = completedMap.get(sim.id);
          const isCompleted = highestScore !== undefined;

          return (
            <div
              key={sim.id}
              className={`rounded-3xl border transition-all flex flex-col justify-between p-6 shadow-xl ${
                sim.isImplemented
                  ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 hover:shadow-cyan-500/5'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-80'
              }`}
            >
              <div className="space-y-4">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase tracking-wider ${getSubjectBadge(sim.subject)}`}>
                      {getSubjectIcon(sim.subject)}
                      <span>{sim.subject}</span>
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {sim.difficulty}
                    </span>
                  </div>

                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{highestScore}%</span>
                    </span>
                  )}
                </div>

                {/* Title & Topic */}
                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {sim.title}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400/90 mt-0.5">
                    {sim.topic}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {sim.description}
                </p>

                {/* Learning Objectives Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sim.learningObjectives.slice(0, 2).map((obj, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-slate-400 truncate max-w-full"
                    >
                      • {obj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button & Time Estimate */}
              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>~{sim.estimatedMinutes} mins</span>
                </div>

                {sim.isImplemented ? (
                  <button
                    onClick={() => onSelectSimulation(sim.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
                  >
                    <span>Launch Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs font-medium">
                    Roadmap Phase
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSimulations.length === 0 && (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 space-y-3">
          <Compass className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            No simulations match your current filters.
          </p>
          <button
            onClick={() => {
              setSelectedSubject('all');
              setSelectedDifficulty('all');
              setSearchQuery('');
              setFilterType('all');
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
