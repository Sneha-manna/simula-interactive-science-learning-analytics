import React, { useRef, useEffect, useState } from 'react';
import { FlaskConical, Droplet, RotateCcw, Plus, Minus, TestTube } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface AcidBaseSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const AcidBaseSim: React.FC<AcidBaseSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'chem-acid-base')!;

  const initialPh = values.initialPh ?? 7;
  const titrantVol = values.titrantVol ?? 25;
  const titrantType = values.titrantType ?? 1; // 1 = NaOH (base), -1 = HCl (acid)

  // Calculate dynamic pH based on titration curve formula
  // Standard 50mL of 0.1M analyte titrated with 0.1M titrant
  const calculateTitratedPh = (vol: number, type: number, startPh: number) => {
    // Equivalence volume at 25mL
    const V_eq = 25;
    const deltaV = (vol - V_eq) * type;

    if (Math.abs(deltaV) < 0.1) return 7.0;

    if (deltaV > 0) {
      // Past equivalence: excess strong base
      const excessMoles = (deltaV / 1000) * 0.1;
      const totalVolumeL = (50 + vol) / 1000;
      const concOH = excessMoles / totalVolumeL;
      const pOH = -Math.log10(Math.max(1e-14, concOH));
      return Math.min(14, Math.max(7, 14 - pOH));
    } else {
      // Before equivalence: excess strong acid
      const excessMoles = (-deltaV / 1000) * 0.1;
      const totalVolumeL = (50 + vol) / 1000;
      const concH = excessMoles / totalVolumeL;
      const ph = -Math.log10(Math.max(1e-14, concH));
      return Math.min(7, Math.max(0, ph));
    }
  };

  const currentPh = calculateTitratedPh(titrantVol, titrantType, initialPh);
  const concH = Math.pow(10, -currentPh);
  const concOH = Math.pow(10, -(14 - currentPh));

  // Determine Universal Indicator color based on pH
  const getSolutionColor = (ph: number) => {
    if (ph <= 2) return { bg: 'rgba(239, 68, 68, 0.8)', label: 'Strong Acid (Red)' };
    if (ph <= 4) return { bg: 'rgba(249, 115, 22, 0.8)', label: 'Moderate Acid (Orange)' };
    if (ph <= 6) return { bg: 'rgba(234, 179, 8, 0.8)', label: 'Weak Acid (Yellow)' };
    if (ph <= 7.5) return { bg: 'rgba(34, 197, 94, 0.8)', label: 'Neutral (Green)' };
    if (ph <= 9) return { bg: 'rgba(6, 182, 212, 0.8)', label: 'Weak Base (Teal)' };
    if (ph <= 11) return { bg: 'rgba(59, 130, 246, 0.8)', label: 'Moderate Base (Blue)' };
    return { bg: 'rgba(147, 51, 234, 0.8)', label: 'Strong Base (Purple)' };
  };

  const solInfo = getSolutionColor(currentPh);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic pH Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Universal Chemical Indicator
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>pH =</span>
                <span className="text-cyan-300">{currentPh.toFixed(2)}</span>
                <span className="text-xs font-normal text-slate-400">({solInfo.label})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              [H⁺] = {concH.toExponential(2)} M
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              [OH⁻] = {concOH.toExponential(2)} M
            </span>
          </div>
        </div>

        {/* Beaker & Titration Apparatus Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {/* Beaker Apparatus */}
          <div className="relative flex flex-col items-center">
            {/* Buret Dropper Top */}
            <div className="w-6 h-28 bg-slate-800/80 border border-slate-700 rounded-t-md relative flex flex-col items-center justify-end">
              <div className="absolute top-1 text-[8px] font-mono text-slate-400">Buret</div>
              {/* Liquid inside buret */}
              <div className="w-full bg-cyan-500/40 rounded-t-sm" style={{ height: '70%' }} />
              <div className="w-2 h-4 bg-slate-600" />
            </div>

            {/* Falling Drop */}
            <div className="my-2 animate-bounce">
              <Droplet className="w-4 h-4 text-cyan-400 fill-cyan-400/80" />
            </div>

            {/* Glass Beaker */}
            <div className="w-48 h-56 border-x-4 border-b-4 border-slate-400/50 rounded-b-3xl relative overflow-hidden bg-slate-900/40 backdrop-blur-sm shadow-inner">
              {/* Beaker Volume Graduations */}
              <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between text-[9px] font-mono text-slate-400 select-none">
                <span>100 mL —</span>
                <span>80 mL —</span>
                <span>60 mL —</span>
                <span>40 mL —</span>
                <span>20 mL —</span>
              </div>

              {/* Liquid Level with indicator color */}
              <div
                className="absolute bottom-0 inset-x-0 transition-all duration-300 rounded-b-2xl"
                style={{
                  height: `${Math.min(85, 35 + titrantVol * 1.0)}%`,
                  backgroundColor: solInfo.bg,
                }}
              >
                {/* Surface Meniscus Line */}
                <div className="w-full h-1.5 bg-white/30 rounded-t-full" />
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 mt-2">
              Analyte Volume: {(50 + titrantVol).toFixed(0)} mL
            </div>
          </div>

          {/* Real-time Titration Curve SVG */}
          <div className="w-full md:w-80 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Sigmoidal Titration Curve</span>
              <span className="font-mono text-cyan-400">V_eq = 25.0 mL</span>
            </div>

            <div className="h-56 bg-slate-900/80 border border-slate-800 rounded-xl p-3 relative">
              <svg viewBox="0 0 280 180" className="w-full h-full overflow-visible">
                {/* Axes */}
                <line x1="30" y1="10" x2="30" y2="150" stroke="#475569" strokeWidth="1.5" />
                <line x1="30" y1="150" x2="270" y2="150" stroke="#475569" strokeWidth="1.5" />

                {/* pH 7 Equivalence Line */}
                <line x1="30" y1="80" x2="270" y2="80" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                <text x="272" y="83" fill="#10b981" fontSize="8" fontFamily="monospace">pH 7</text>

                {/* Curve plotting */}
                <path
                  d={(() => {
                    const points = [];
                    for (let v = 0; v <= 50; v += 1) {
                      const ph = calculateTitratedPh(v, titrantType, initialPh);
                      const px = 30 + (v / 50) * 230;
                      const py = 150 - (ph / 14) * 140;
                      points.push(`${v === 0 ? 'M' : 'L'} ${px} ${py}`);
                    }
                    return points.join(' ');
                  })()}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Current State Marker on Curve */}
                {(() => {
                  const currentPx = 30 + (titrantVol / 50) * 230;
                  const currentPy = 150 - (currentPh / 14) * 140;
                  return (
                    <g>
                      <circle cx={currentPx} cy={currentPy} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  );
                })()}

                {/* Axis Labels */}
                <text x="30" y="165" fill="#64748b" fontSize="8" fontFamily="monospace">0 mL</text>
                <text x="145" y="165" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">25 mL</text>
                <text x="260" y="165" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">50 mL</text>

                <text x="25" y="150" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">0</text>
                <text x="25" y="15" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">14</text>
              </svg>
            </div>

            <div className="text-[11px] text-slate-400 text-center font-mono">
              Yellow Marker: Current Titrant Added = {titrantVol} mL
            </div>
          </div>
        </div>

        {/* Standard pH Reference Spectrum */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            The 0–14 Universal pH Scale Spectrum
          </span>
          <div className="h-4 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-cyan-400 to-purple-600 relative overflow-hidden" />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>0: Battery Acid</span>
            <span>3: Vinegar</span>
            <span>7: Pure H₂O</span>
            <span>10: Soap</span>
            <span>14: Drain Cleaner</span>
          </div>
        </div>
      </div>

      {/* Right Col: Controls */}
      <div className="space-y-4">
        <SimulationControls
          controls={metadata.controls}
          values={values}
          onChange={(id, val) => {
            setValue(id, val);
            incrementRunCount();
          }}
          onReset={resetValues}
          extraControls={
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Titrant Selection
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  onClick={() => {
                    setValue('titrantType', 1);
                    incrementRunCount();
                  }}
                  className={`p-2 rounded-xl border transition-colors text-left ${
                    titrantType === 1
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold">0.1 M NaOH</div>
                  <div className="text-[10px] text-slate-400">Strong Base</div>
                </button>
                <button
                  onClick={() => {
                    setValue('titrantType', -1);
                    incrementRunCount();
                  }}
                  className={`p-2 rounded-xl border transition-colors text-left ${
                    titrantType === -1
                      ? 'bg-red-500/20 border-red-500/50 text-red-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold">0.1 M HCl</div>
                  <div className="text-[10px] text-slate-400">Strong Acid</div>
                </button>
              </div>
            </div>
          }
        />

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <TestTube className="w-3.5 h-3.5" />
            Equivalence Point Shift
          </div>
          <p className="text-slate-300 leading-relaxed">
            At exactly 25.0 mL of titrant, the stoichiometric moles of <span className="text-red-300 font-mono">H⁺</span> equal <span className="text-blue-300 font-mono">OH⁻</span>. Because pH is logarithmic, a single drop near 25 mL triggers a steep 6-unit vertical surge in pH!
          </p>
        </div>
      </div>
    </div>
  );
};
