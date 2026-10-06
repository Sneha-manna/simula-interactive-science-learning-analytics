import React, { useState } from 'react';
import { RefreshCw, ArrowLeftRight, Flame, Snowflake, Activity } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface ChemicalEquilibriumSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const ChemicalEquilibriumSim: React.FC<ChemicalEquilibriumSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isLeChatelier = metadata.id === 'chem-le-chatelier';
  const isQvsK = metadata.id === 'chem-reaction-quotient';

  // System parameters for N2O4 (colorless gas) <=> 2 NO2 (brown gas)
  // Endothermic in forward direction: ΔH = +57.2 kJ/mol
  const temperature = values.temperature ?? 298; // K
  const pressure = values.pressure ?? 1.0; // atm
  const addedN2O4 = values.addedReactant ?? 1.0;
  const addedNO2 = values.addedProduct ?? 1.0;

  // Temperature effect: K_eq increases with T for endothermic
  // van 't Hoff equation approximation
  const K_base = 0.115; // at 298K
  const K_eq = K_base * Math.exp(((57200 / 8.314) * (1 / 298 - 1 / temperature)) * -1);

  // Reaction Quotient Q = [NO2]^2 / [N2O4]
  const concNO2 = (addedNO2 * Math.sqrt(temperature / 298)) / Math.max(0.5, 1 / pressure);
  const concN2O4 = (addedN2O4 * pressure) / 1.0;
  const Q = Math.pow(concNO2, 2) / Math.max(0.01, concN2O4);

  // Visual brown intensity (NO2 concentration)
  const brownIntensity = Math.min(0.9, Math.max(0.05, concNO2 * 0.35));

  // Determine shift direction
  let shiftDirection = 'In Dynamic Equilibrium';
  if (Q < K_eq * 0.85) {
    shiftDirection = 'Shifts FORWARD (➔ Products: More NO₂ formed)';
  } else if (Q > K_eq * 1.15) {
    shiftDirection = 'Shifts REVERSE (⬅ Reactants: More N₂O₄ formed)';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Dynamic Equilibrium State
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>N₂O₄(g) ⇌ 2 NO₂(g)</span>
                <span className="text-xs font-normal text-amber-400">(ΔH° = +57.2 kJ/mol)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              K_eq = {K_eq.toFixed(3)}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
              Q = {Q.toFixed(3)}
            </span>
            <span className={`px-2.5 py-1 rounded-lg border font-bold ${
              Math.abs(Q - K_eq) < 0.15 ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            }`}>
              {Math.abs(Q - K_eq) < 0.15 ? 'Q = K (Equilibrium)' : Q < K_eq ? 'Q < K (Forward)' : 'Q > K (Reverse)'}
            </span>
          </div>
        </div>

        {/* Visual Lab Flask Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {/* Gas Flask with dynamic brown color */}
          <div className="flex flex-col items-center">
            <div className="relative w-56 h-64 border-4 border-slate-700 rounded-b-full rounded-t-2xl bg-slate-900/30 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Colored Gas Filling */}
              <div
                className="absolute inset-0 transition-colors duration-700"
                style={{
                  backgroundColor: `rgba(180, 83, 9, ${brownIntensity})`,
                }}
              />

              {/* Floating Gas Molecules */}
              <div className="relative z-10 p-4 flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`n2o4-${i}`} className="px-2 py-1 bg-slate-800/80 border border-slate-600 rounded-full text-[10px] font-mono text-slate-300 shadow">
                    N₂O₄ (Colorless)
                  </div>
                ))}
                {Array.from({ length: Math.round(brownIntensity * 14) }).map((_, i) => (
                  <div key={`no2-${i}`} className="px-2 py-1 bg-amber-900/90 border border-amber-600 rounded-full text-[10px] font-mono text-amber-200 shadow font-bold">
                    NO₂ (Brown)
                  </div>
                ))}
              </div>
            </div>

            <span className="text-xs font-mono text-slate-400 mt-3">
              Sealed Reaction Vessel (T = {temperature} K, P = {pressure.toFixed(1)} atm)
            </span>
          </div>

          {/* Le Chatelier Diagnosis */}
          <div className="w-full md:w-72 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Le Chatelier Response
              </span>
              <div className="text-xs font-bold text-amber-400 leading-relaxed font-mono">
                {shiftDirection}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {temperature > 300
                  ? 'Increasing temperature adds heat, driving the endothermic forward reaction to consume excess thermal energy (darker brown).'
                  : pressure > 1.2
                  ? 'Increasing pressure favors the side with fewer gas moles (1 mole N₂O₄ vs 2 moles NO₂), shifting left to lighten the color.'
                  : 'System counteracts external stresses to restore chemical equilibrium.'}
              </p>
            </div>

            {/* Q vs K Comparison Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Q = {Q.toFixed(2)}</span>
                <span>K_eq = {K_eq.toFixed(2)}</span>
              </div>
              <div className="h-4 bg-slate-950 rounded-full overflow-hidden relative border border-slate-800">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (Q / (K_eq * 2)) * 100)}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-400"
                  style={{ left: '50%' }}
                  title="Equilibrium Target K"
                />
              </div>
              <div className="text-center text-[10px] text-slate-400">
                Left = Favors Products | Center = At Equilibrium | Right = Favors Reactants
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-6">
        <SimulationControls
          controls={metadata.controls}
          values={values}
          onChange={(id, val) => {
            setValue(id, val);
            incrementRunCount();
          }}
          onReset={resetValues}
        />
      </div>
    </div>
  );
};
