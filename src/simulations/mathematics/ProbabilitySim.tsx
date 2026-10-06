import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Dices, Award } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface ProbabilitySimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const ProbabilitySim: React.FC<ProbabilitySimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'math-probability')!;

  const trials = Math.round(values.trials ?? 200);
  const bias = values.bias ?? 0.5;

  const [isRunning, setIsRunning] = useState(false);
  const [headsCount, setHeadsCount] = useState(104);
  const [tailsCount, setTailsCount] = useState(96);
  const [convergenceData, setConvergenceData] = useState<{ step: number; ratio: number }[]>([]);

  // Calculate stats
  const totalFlips = headsCount + tailsCount;
  const empiricalP = totalFlips > 0 ? headsCount / totalFlips : 0;
  const theoreticalP = bias;
  const standardError = Math.sqrt((theoreticalP * (1 - theoreticalP)) / Math.max(1, totalFlips));
  const errorDelta = Math.abs(empiricalP - theoreticalP);

  // Run Monte Carlo simulation
  const runSimulation = () => {
    setIsRunning(true);
    incrementRunCount();

    let heads = 0;
    const history: { step: number; ratio: number }[] = [];
    const sampleInterval = Math.max(1, Math.floor(trials / 60));

    for (let i = 1; i <= trials; i++) {
      if (Math.random() < bias) {
        heads++;
      }
      if (i % sampleInterval === 0 || i === trials) {
        history.push({
          step: i,
          ratio: parseFloat((heads / i).toFixed(4)),
        });
      }
    }

    setHeadsCount(heads);
    setTailsCount(trials - heads);
    setConvergenceData(history);
    setIsRunning(false);
  };

  useEffect(() => {
    runSimulation();
  }, [bias, trials]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Probability Metrics Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Sample Size N = {totalFlips}
              </div>
              <div className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Empirical P:</span>
                <span className="font-mono text-cyan-300">{(empiricalP * 100).toFixed(1)}%</span>
                <span className="text-xs text-slate-400">(Theory: {(theoreticalP * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Simulating...' : 'Rerun Experiment'}</span>
          </button>
        </div>

        {/* Convergence SVG Chart (Law of Large Numbers) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">
              Convergence to Expected Value (Law of Large Numbers)
            </span>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block border-dashed" />
                Theoretical ({(theoreticalP * 100).toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-1 bg-cyan-400 rounded inline-block" />
                Empirical Ratio
              </span>
            </div>
          </div>

          {/* SVG Plot */}
          <div className="h-64 w-full relative">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="65" x2="580" y2="65" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="110" x2="580" y2="110" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="155" x2="580" y2="155" stroke="#1e293b" strokeWidth="1" />

              {/* Theoretical Expected Line */}
              {(() => {
                const targetY = 180 - theoreticalP * 160;
                return (
                  <g>
                    <line
                      x1="40"
                      y1={targetY}
                      x2="580"
                      y2={targetY}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <text x="585" y={targetY + 4} fill="#f59e0b" fontSize="9" fontFamily="monospace">
                      {(theoreticalP * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })()}

              {/* Empirical Path */}
              {convergenceData.length > 1 && (
                <path
                  d={convergenceData
                    .map((pt, i) => {
                      const x = 40 + (i / (convergenceData.length - 1)) * 540;
                      const y = Math.max(10, Math.min(190, 180 - pt.ratio * 160));
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                />
              )}

              {/* Axis Labels */}
              <text x="40" y="195" fill="#64748b" fontSize="9" fontFamily="monospace">
                Trial 1
              </text>
              <text x="310" y="195" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                Trial {Math.round(trials / 2)}
              </text>
              <text x="580" y="195" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                Trial {trials}
              </text>
            </svg>
          </div>
        </div>

        {/* Visual Outcome Histogram & Frequency Bars */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Observed Frequency Distribution</span>
            <span className="font-mono text-slate-400">Total Trials: {totalFlips}</span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-cyan-300">Heads (Success): {headsCount} ({((headsCount / totalFlips) * 100).toFixed(1)}%)</span>
                <span className="text-slate-400">Expected: {Math.round(totalFlips * theoreticalP)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(headsCount / totalFlips) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-indigo-300">Tails (Failure): {tailsCount} ({((tailsCount / totalFlips) * 100).toFixed(1)}%)</span>
                <span className="text-slate-400">Expected: {Math.round(totalFlips * (1 - theoreticalP))}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(tailsCount / totalFlips) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Col: Controls & Statistical Diagnostics */}
      <div className="space-y-4">
        <SimulationControls
          controls={metadata.controls}
          values={values}
          onChange={(id, val) => {
            setValue(id, val);
            incrementRunCount();
          }}
          onReset={resetValues}
        />

        {/* Statistical Analysis Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Statistical Rigor Diagnostics
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">Standard Error (SE):</span>
              <span className="text-cyan-300 font-bold">±{(standardError * 100).toFixed(2)}%</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">Deviation from Theory:</span>
              <span className={`font-bold ${errorDelta < standardError ? 'text-emerald-300' : 'text-amber-300'}`}>
                {(errorDelta * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">95% Conf. Interval:</span>
              <span className="text-slate-200">
                {Math.max(0, (empiricalP - 1.96 * standardError) * 100).toFixed(1)}% – {Math.min(100, (empiricalP + 1.96 * standardError) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            Notice how increasing <span className="text-cyan-300 font-mono">N</span> dramatically flattens the convergence curve, compressing the standard error proportional to <span className="text-cyan-300 font-mono">1/√N</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
