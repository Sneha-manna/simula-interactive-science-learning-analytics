import React, { useState } from 'react';
import { Beaker, Droplet, Plus, Minus, Layers, AlertCircle } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface SolutionsSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const SolutionsSim: React.FC<SolutionsSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isDilution = metadata.id === 'chem-dilution';
  const isSolubility = metadata.id === 'chem-solubility';
  const isConcentration = metadata.id === 'chem-concentration';

  // Solute selection (1: CuSO4 - Blue, 2: KMnO4 - Purple, 3: K2Cr2O7 - Orange, 4: NaCl - Clear)
  const soluteId = Math.round(values.solute ?? (values.substance ?? 1));
  const SOLUTES: Record<number, { name: string; formula: string; color: string; maxSolubility: number; mw: number }> = {
    1: { name: 'Copper(II) Sulfate', formula: 'CuSO₄', color: '#0284c7', maxSolubility: 1.4, mw: 159.6 },
    2: { name: 'Potassium Permanganate', formula: 'KMnO₄', color: '#9333ea', maxSolubility: 0.5, mw: 158.0 },
    3: { name: 'Potassium Dichromate', formula: 'K₂Cr₂O₇', color: '#ea580c', maxSolubility: 0.8, mw: 294.2 },
    4: { name: 'Sodium Chloride', formula: 'NaCl', color: '#38bdf8', maxSolubility: 6.1, mw: 58.4 },
  };
  const activeSolute = SOLUTES[soluteId] || SOLUTES[1];

  // Base parameters
  let soluteMoles = values.soluteMoles ?? (values.moles ?? 0.5);
  let solutionVolL = values.volume ?? (values.solutionVol ?? 0.5); // Liters

  if (isDilution) {
    const m1 = values.m1 ?? 2.0;
    const v1 = values.v1 ?? 0.1; // L
    const addedWater = values.addedWater ?? 0.4; // L
    solutionVolL = v1 + addedWater;
    soluteMoles = m1 * v1;
  }

  // Molarity M = n / V
  const molarity = soluteMoles / Math.max(0.05, solutionVolL);

  // Saturation check
  const isSaturated = molarity > activeSolute.maxSolubility;
  const dissolvedMoles = isSaturated ? activeSolute.maxSolubility * solutionVolL : soluteMoles;
  const precipitateMoles = isSaturated ? soluteMoles - dissolvedMoles : 0;
  const precipitateGrams = precipitateMoles * activeSolute.mw;

  // Color saturation percentage (capped at 100%)
  const colorOpacity = Math.min(0.9, Math.max(0.15, (dissolvedMoles / (solutionVolL * activeSolute.maxSolubility)) * 0.85));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border"
              style={{ backgroundColor: `${activeSolute.color}20`, borderColor: `${activeSolute.color}50`, color: activeSolute.color }}
            >
              <Beaker className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isSolubility ? 'Solubility & Precipitation' : 'Aqueous Solution Molarity'}
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>{activeSolute.name}</span>
                <span className="text-xs font-normal text-slate-400">({activeSolute.formula})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-bold">
              M = {molarity.toFixed(3)} M (mol/L)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              V = {solutionVolL.toFixed(2)} L
            </span>
            <span className={`px-2.5 py-1 rounded-lg border font-bold ${
              isSaturated ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
            }`}>
              {isSaturated ? `Saturated (${precipitateGrams.toFixed(1)}g Precipitate)` : 'Unsaturated Solution'}
            </span>
          </div>
        </div>

        {/* Visual Lab Beaker Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {/* Glass Beaker */}
          <div className="relative w-56 h-64 border-x-4 border-b-4 border-slate-700/80 rounded-b-3xl bg-slate-900/30 overflow-hidden shadow-2xl flex flex-col justify-end">
            {/* Liquid Volume */}
            <div
              className="w-full transition-all duration-500 relative flex items-center justify-center"
              style={{
                height: `${Math.min(95, Math.max(20, solutionVolL * 90))}%`,
                backgroundColor: activeSolute.color,
                opacity: colorOpacity,
              }}
            >
              {/* Floating Solute Ions */}
              <div className="absolute inset-0 p-4 flex flex-wrap items-center justify-around pointer-events-none">
                {Array.from({ length: Math.min(24, Math.round(dissolvedMoles * 20)) }).map((_, i) => (
                  <div
                    key={`ion-${i}`}
                    className="w-2 h-2 rounded-full bg-white/80 shadow m-1 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Precipitate sediment at the bottom if saturated */}
            {isSaturated && (
              <div
                className="w-full bg-amber-600/90 border-t border-amber-400/60 transition-all duration-300 flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-lg"
                style={{ height: `${Math.min(30, 8 + precipitateMoles * 15)}px` }}
              >
                Precipitate ({precipitateGrams.toFixed(1)}g)
              </div>
            )}

            {/* Volume Graduations */}
            <div className="absolute left-2 inset-y-4 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-slate-500">
              <span>1.0 L</span>
              <span>0.75 L</span>
              <span>0.5 L</span>
              <span>0.25 L</span>
            </div>
          </div>

          {/* Concentration Details & Molarity Breakdown */}
          <div className="w-full md:w-64 space-y-4 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Solute Concentration Specs
              </span>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Total Solute:</span>
                <span className="text-slate-200">{(soluteMoles * activeSolute.mw).toFixed(1)} g</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Dissolved Moles:</span>
                <span className="text-cyan-300 font-bold">{dissolvedMoles.toFixed(3)} mol</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Saturation Limit:</span>
                <span className="text-amber-400">{activeSolute.maxSolubility} M</span>
              </div>
            </div>

            {/* Formula Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Solution Equation</span>
              <span className="text-cyan-300 font-bold block text-sm">
                {isDilution ? 'M₁ · V₁ = M₂ · V₂' : 'Molarity M = moles / Liters'}
              </span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Dilution decreases concentration by increasing volume while total moles of solute remain constant.
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
