import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Sliders,
  CheckSquare,
  Activity,
  Maximize2,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { SimulationMetadata, ExperimentRunResult } from '../../types/simulation';
import { TheoryPanel } from './TheoryPanel';
import { SimulationQuiz } from './SimulationQuiz';
import { ExperimentResultsModal } from './ExperimentResultsModal';
import { storageService } from '../../storage/localStorage';

interface SimulationContainerProps {
  metadata: SimulationMetadata;
  onBack: () => void;
  onNavigateToSim?: (simId: string) => void;
  children: (props: {
    values: Record<string, number>;
    setValue: (id: string, value: number) => void;
    resetValues: () => void;
    runCount: number;
    incrementRunCount: () => void;
  }) => React.ReactNode;
}

export const SimulationContainer: React.FC<SimulationContainerProps> = ({
  metadata,
  onBack,
  onNavigateToSim,
  children,
}) => {
  // Initialize parameter values from metadata
  const initialValues = metadata.controls.reduce((acc, ctrl) => {
    acc[ctrl.id] = ctrl.defaultValue;
    return acc;
  }, {} as Record<string, number>);

  const [values, setValues] = useState<Record<string, number>>(initialValues);
  const [activeTab, setActiveTab] = useState<'experiment' | 'theory' | 'quiz' | 'telemetry'>('experiment');
  const [runCount, setRunCount] = useState(1);
  const [startTime] = useState(Date.now());
  const [completedResult, setCompletedResult] = useState<ExperimentRunResult | null>(null);

  // Timer for session
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSetValue = (id: string, val: number) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  const handleResetValues = () => {
    setValues(initialValues);
  };

  const handleIncrementRun = () => {
    setRunCount((prev) => prev + 1);
  };

  const handleFinishQuiz = (quizStats: { correctCount: number; totalCount: number; answers: number[] }) => {
    const accuracy = Math.round((quizStats.correctCount / quizStats.totalCount) * 100);
    // Score combines quiz accuracy, experimentation attempts (capped at bonus), and completion
    const attemptBonus = Math.min(runCount * 4, 15);
    const calculatedScore = Math.min(100, Math.round(accuracy * 0.85 + attemptBonus));

    let understanding: 'Needs Review' | 'Developing' | 'Good' | 'Mastered' = 'Good';
    if (accuracy >= 90) understanding = 'Mastered';
    else if (accuracy >= 70) understanding = 'Good';
    else if (accuracy >= 50) understanding = 'Developing';
    else understanding = 'Needs Review';

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (accuracy >= 80) {
      strengths.push('Excellent theoretical comprehension of governing formulas');
      strengths.push('Strong deduction of independent vs dependent variables');
    } else {
      weaknesses.push('Review the governing equations and parameter boundary values');
    }

    if (runCount >= 2) {
      strengths.push(`Explored multiple parametric states (${runCount} experiment runs)`);
    } else {
      weaknesses.push('Try adjusting more parameter combinations before taking the assessment');
    }

    const runResult: ExperimentRunResult = {
      simulationId: metadata.id,
      simulationTitle: metadata.title,
      subject: metadata.subject,
      topic: metadata.topic,
      difficulty: metadata.difficulty,
      timeSpentSeconds: elapsedSeconds,
      attemptsCount: runCount,
      correctAnswers: quizStats.correctCount,
      totalQuestions: quizStats.totalCount,
      score: calculatedScore,
      accuracy,
      conceptUnderstanding: understanding,
      strengths,
      weaknesses,
      recommendedSimulationId: metadata.recommendedNextTopics[0],
      timestamp: new Date().toISOString(),
    };

    // Save to local storage
    storageService.addLog({
      simulationId: metadata.id,
      simulationTitle: metadata.title,
      subject: metadata.subject,
      topic: metadata.topic,
      difficulty: metadata.difficulty,
      timestamp: runResult.timestamp,
      durationSeconds: elapsedSeconds,
      score: calculatedScore,
      accuracy,
      attempts: runCount,
      mistakesCount: quizStats.totalCount - quizStats.correctCount,
      questionsAnswered: quizStats.totalCount,
      passed: accuracy >= 60,
    });

    setCompletedResult(runResult);
  };

  const getSubjectColor = () => {
    switch (metadata.subject) {
      case 'mathematics':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'physics':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'chemistry':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Library</span>
          </button>

          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border uppercase tracking-wider ${getSubjectColor()}`}>
            {metadata.subject}
          </span>

          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs font-medium text-slate-300">{metadata.topic}</span>
        </div>

        {/* Live Session Telemetry Counters */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Session: {formatElapsed(elapsedSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Runs: {runCount}</span>
          </div>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
            title="Copy Simulation Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              {metadata.title}
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {metadata.difficulty}
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-3xl">
            {metadata.description}
          </p>
        </div>

        {/* Complete & Evaluate Button */}
        <button
          onClick={() => setActiveTab('quiz')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Verify Understanding</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('experiment')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-colors ${
            activeTab === 'experiment'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Interactive Experiment</span>
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-colors ${
            activeTab === 'theory'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Theory &amp; Formulas</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-colors ${
            activeTab === 'quiz'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Verification Assessment</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-colors ${
            activeTab === 'telemetry'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Telemetry Log</span>
        </button>
      </div>

      {/* Main Tab View Contents */}
      {activeTab === 'experiment' && (
        <div className="animate-in fade-in duration-150">
          {children({
            values,
            setValue: handleSetValue,
            resetValues: handleResetValues,
            runCount,
            incrementRunCount: handleIncrementRun,
          })}
        </div>
      )}

      {activeTab === 'theory' && (
        <div className="animate-in fade-in duration-150">
          <TheoryPanel metadata={metadata} />
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto py-4 animate-in fade-in duration-150">
          <SimulationQuiz
            questions={metadata.questions}
            onFinishQuiz={handleFinishQuiz}
          />
        </div>
      )}

      {activeTab === 'telemetry' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 font-mono text-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">
              Real-Time Mathematical &amp; Physical Parameters
            </span>
            <span className="text-slate-500">Node: SIMULAB-LOCAL-ENGINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(values).map(([k, v]) => (
              <div key={k} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">{k}:</span>
                <span className="text-cyan-300 font-bold">{v}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-slate-400 space-y-1">
            <p>• Mathematical Precision: 64-bit IEEE 754 floating-point local calculation</p>
            <p>• Rendering Subsystem: HTML5 Canvas 2D + SVG Vector Graph Engine</p>
            <p>• Physics Integration: Discrete Verlet / Runge-Kutta numerical stepping</p>
            <p>• Governing Formula: <span className="text-cyan-300">{metadata.explanation.formula}</span></p>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completedResult && (
        <ExperimentResultsModal
          result={completedResult}
          onClose={() => setCompletedResult(null)}
          onRestart={() => {
            setCompletedResult(null);
            handleResetValues();
            setActiveTab('experiment');
          }}
          onGoToRecommended={(nextId) => {
            setCompletedResult(null);
            if (onNavigateToSim) onNavigateToSim(nextId);
          }}
        />
      )}
    </div>
  );
};
