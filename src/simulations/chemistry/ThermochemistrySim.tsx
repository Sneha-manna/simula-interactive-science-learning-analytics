import React, { useState } from 'react';
import { Flame, Snowflake, Activity, ArrowRight, Gauge } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface ThermochemistrySimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const ThermochemistrySim: React.FC<ThermochemistrySimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isEnthalpy = metadata.id === 'chem-enthalpy';
  const isGibbs = metadata.id === 'chem-entropy-gibbs';
  const isHess = metadata.id === 'chem-hess-law';
  // Default is chem-calorimetry

  // Calorimetry: q = m · c · ΔT
  const waterMass = values.waterMass ?? (values.mass ?? 100); // grams
  const initialTemp = values.initialTemp ?? 20.0; // °C
  const finalTemp = values.finalTemp ?? 45.0; // °C
  const deltaT = finalTemp - initialTemp;
  const specificHeat = 4.184; // J/(g·°C) for water
  const heatEnergyJoules = waterMass * specificHeat * deltaT;
  const heatEnergyKJ = heatEnergyJoules / 1000;

  // Gibbs Free Energy: ΔG = ΔH - T·ΔS
  const deltaH = values.deltaH ?? -50; // kJ/mol (negative = exothermic)
  const deltaS = values.deltaS ?? 120; // J/(mol·K)
  const tempKelvin = values.temperature ?? 298; // K
  const deltaG = deltaH - (tempKelvin * deltaS) / 1000;
  const isSpontaneous = deltaG < 0;

  // Enthalpy profile
  const isExothermic = isEnthalpy ? (values.rxnType ?? 1) === 1 : deltaH < 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isExothermic ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              {isExothermic ? <Flame className="w-5 h-5" /> : <Snowflake className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isGibbs ? 'Gibbs Free Energy & Spontaneity' : isEnthalpy ? 'Reaction Enthalpy Profile' : 'Calorimetric Heat Transfer'}
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>
                  {isGibbs ? `ΔG = ${deltaG.toFixed(1)} kJ/mol` :
                   isEnthalpy ? (isExothermic ? 'Exothermic (ΔH < 0)' : 'Endothermic (ΔH > 0)') :
                   `q = ${heatEnergyKJ.toFixed(2)} kJ`}
                </span>
                <span className="text-xs font-normal text-slate-400">
                  {isGibbs ? (isSpontaneous ? '(Spontaneous)' : '(Non-Spontaneous)') : `(ΔT = ${deltaT.toFixed(1)}°C)`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            {isGibbs ? (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  ΔH = {deltaH} kJ/mol
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  ΔS = {deltaS} J/mol·K
                </span>
                <span className={`px-2.5 py-1 rounded-lg border font-bold ${
                  isSpontaneous ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                }`}>
                  {isSpontaneous ? 'Feasible / Spontaneous' : 'Non-Spontaneous'}
                </span>
              </>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  m = {waterMass} g
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  c = 4.184 J/g°C
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                  {heatEnergyJoules.toFixed(0)} Joules
                </span>
              </>
            )}
          </div>
        </div>

        {/* Visual Calorimeter / Energy Canvas Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {isEnthalpy || isGibbs ? (
            /* Energy Level Diagram */
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-md h-60 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 120">
                  <line x1="20" y1="10" x2="20" y2="110" stroke="#475569" strokeWidth="1" />
                  <text x="5" y="15" fill="#94a3b8" fontSize="7" fontFamily="monospace">Enthalpy H</text>

                  {isExothermic ? (
                    <>
                      {/* Reactants high */}
                      <line x1="30" y1="35" x2="80" y2="35" stroke="#f97316" strokeWidth="3" />
                      <text x="35" y="30" fill="#f97316" fontSize="8" fontFamily="monospace">Reactants</text>
                      {/* Curve down */}
                      <path d="M 80,35 Q 110,15 130,85 L 180,85" fill="none" stroke="#ef4444" strokeWidth="2" />
                      {/* Products low */}
                      <line x1="130" y1="85" x2="180" y2="85" stroke="#38bdf8" strokeWidth="3" />
                      <text x="135" y="98" fill="#38bdf8" fontSize="8" fontFamily="monospace">Products</text>
                      {/* Heat released arrow */}
                      <line x1="105" y1="35" x2="105" y2="85" stroke="#eab308" strokeWidth="1.5" strokeDasharray="2,2" />
                      <text x="110" y="60" fill="#eab308" fontSize="7" fontFamily="monospace">ΔH &lt; 0 (Released)</text>
                    </>
                  ) : (
                    <>
                      {/* Reactants low */}
                      <line x1="30" y1="85" x2="80" y2="85" stroke="#38bdf8" strokeWidth="3" />
                      <text x="35" y="98" fill="#38bdf8" fontSize="8" fontFamily="monospace">Reactants</text>
                      {/* Curve up */}
                      <path d="M 80,85 Q 110,25 130,35 L 180,35" fill="none" stroke="#06b6d4" strokeWidth="2" />
                      {/* Products high */}
                      <line x1="130" y1="35" x2="180" y2="35" stroke="#f97316" strokeWidth="3" />
                      <text x="135" y="30" fill="#f97316" fontSize="8" fontFamily="monospace">Products</text>
                      {/* Heat absorbed arrow */}
                      <line x1="105" y1="85" x2="105" y2="35" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2,2" />
                      <text x="110" y="60" fill="#06b6d4" fontSize="7" fontFamily="monospace">ΔH &gt; 0 (Absorbed)</text>
                    </>
                  )}
                </svg>
              </div>

              <span className="text-xs font-mono text-slate-400 mt-3">
                Potential Energy Profile: {isExothermic ? 'Exothermic release of bond energy to surroundings' : 'Endothermic absorption of thermal energy'}
              </span>
            </div>
          ) : (
            /* Coffee-Cup Calorimeter Apparatus */
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-60 border-4 border-slate-700 rounded-b-2xl bg-slate-900/30 overflow-hidden flex flex-col justify-end shadow-2xl">
                {/* Insulated double foam jacket */}
                <div className="absolute inset-0 border-8 border-slate-800/80 pointer-events-none" />

                {/* Water filling */}
                <div
                  className="w-full bg-cyan-600/40 transition-colors duration-500 flex items-center justify-center relative"
                  style={{ height: `${Math.min(85, (waterMass / 150) * 80)}%` }}
                >
                  <span className="text-[10px] font-mono text-cyan-200">
                    {waterMass} g Water
                  </span>
                </div>

                {/* Thermometer Stem */}
                <div className="absolute top-2 left-10 w-3 h-48 bg-slate-200 border border-slate-400 rounded-b shadow flex flex-col justify-end overflow-hidden">
                  <div
                    className="w-full bg-red-500 transition-all duration-300"
                    style={{ height: `${Math.min(95, Math.max(10, (finalTemp / 100) * 100))}%` }}
                  />
                </div>

                {/* Stirrer rod */}
                <div className="absolute top-2 right-12 w-2 h-44 bg-slate-400 rounded" />
              </div>

              <span className="text-xs font-mono text-slate-400 mt-2">
                Constant-Pressure Solution Calorimeter
              </span>
            </div>
          )}

          {/* Governing Equation Panel */}
          <div className="w-full md:w-64 space-y-4 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Thermochemical Formula
              </span>
              <span className="text-amber-300 font-bold block text-sm">
                {isGibbs ? 'ΔG = ΔH - T · ΔS' : 'q = m · c · ΔT'}
              </span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {isGibbs
                  ? 'A reaction is spontaneous at constant T and P only if the change in Gibbs free energy ΔG is strictly negative.'
                  : 'Measures the thermal heat transferred into or out of the aqueous calorimeter system based on water temperature change.'}
              </p>
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
