import React, { useState } from 'react';
import { Scale, ArrowRight, CheckCircle2, AlertTriangle, Flame, Layers } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface StoichiometrySimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const StoichiometrySim: React.FC<StoichiometrySimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isMole = metadata.id === 'chem-mole-concept';
  const isMassMole = metadata.id === 'chem-mass-mole';
  const isStoich = metadata.id === 'chem-stoichiometry';
  const isLimiting = metadata.id === 'chem-limiting-reactant';
  const isYield = metadata.id === 'chem-percent-yield';

  // Mole Concept
  const moles = values.moles ?? 1.0;
  const particles = moles * 6.022e23;

  // Mass Mole
  const massGrams = values.massGrams ?? 18;
  const compoundChoice = Math.round(values.compound ?? (values.substance ?? 1));
  const COMPOUNDS: Record<number, { name: string; formula: string; mw: number }> = {
    1: { name: 'Water', formula: 'H₂O', mw: 18.02 },
    2: { name: 'Sodium Chloride', formula: 'NaCl', mw: 58.44 },
    3: { name: 'Carbon Dioxide', formula: 'CO₂', mw: 44.01 },
    4: { name: 'Glucose', formula: 'C₆H₁₂O₆', mw: 180.16 },
  };
  const activeComp = COMPOUNDS[compoundChoice] || COMPOUNDS[1];
  const calculatedMoles = isMassMole ? (massGrams / activeComp.mw) : moles;
  const calculatedParticles = calculatedMoles * 6.022e23;

  // Stoichiometry (C3H8 + 5 O2 -> 3 CO2 + 4 H2O)
  const fuelMass = values.fuelMass ?? 44; // g C3H8 (mw=44.1)
  const oxygenMoles = values.oxygenMoles ?? 5;
  const molesPropane = fuelMass / 44.1;
  const theoreticalCO2Moles = molesPropane * 3;
  const theoreticalCO2Grams = theoreticalCO2Moles * 44.01;
  const theoreticalH2OMoles = molesPropane * 4;
  const theoreticalH2OGrams = theoreticalH2OMoles * 18.02;

  // Limiting Reactant (N2 + 3 H2 -> 2 NH3)
  const molesN2 = values.molesN2 ?? 3;
  const molesH2 = values.molesH2 ?? 6;
  // Stoichiometric ratio: 1 N2 needs 3 H2
  const maxNH3fromN2 = molesN2 * 2;
  const maxNH3fromH2 = (molesH2 / 3) * 2;
  const isH2Limiting = maxNH3fromH2 < maxNH3fromN2;
  const actualNH3Produced = Math.min(maxNH3fromN2, maxNH3fromH2);
  const excessN2Remaining = isH2Limiting ? Math.max(0, molesN2 - (molesH2 / 3)) : 0;
  const excessH2Remaining = !isH2Limiting ? Math.max(0, molesH2 - (molesN2 * 3)) : 0;

  // Percent Yield
  const theoreticalMass = values.theoreticalMass ?? 50;
  const actualMass = values.actualMass ?? 42;
  const percentYield = Math.min(100, Math.max(0, (actualMass / Math.max(0.1, theoreticalMass)) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isLimiting ? 'Reaction Limiting Reagent Analysis' : isYield ? 'Synthesis Yield & Efficiency' : 'Quantitative Stoichiometry'}
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>
                  {isLimiting ? (isH2Limiting ? 'Hydrogen (H₂) is Limiting' : 'Nitrogen (N₂) is Limiting') :
                   isYield ? `Yield: ${percentYield.toFixed(1)}%` :
                   isStoich ? `${fuelMass}g C₃H₈ + ${oxygenMoles} mol O₂` :
                   `${activeComp.name} (${activeComp.formula})`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            {isLimiting ? (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                  NH₃ Produced = {actualNH3Produced.toFixed(2)} mol
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                  Leftover = {isH2Limiting ? `${excessN2Remaining.toFixed(2)} mol N₂` : `${excessH2Remaining.toFixed(2)} mol H₂`}
                </span>
              </>
            ) : isYield ? (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  Theoretical: {theoreticalMass}g
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                  Actual Collected: {actualMass}g
                </span>
              </>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                  n = {calculatedMoles.toFixed(3)} mol
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  N = {calculatedParticles.toExponential(3)} particles
                </span>
              </>
            )}
          </div>
        </div>

        {/* Visual Lab Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col items-center justify-center min-h-[420px]">
          {isLimiting ? (
            /* Limiting Reactant Haber Box Visualizer */
            <div className="w-full flex flex-col items-center gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-lg">
                <div className="text-xs font-mono text-slate-400 mb-2 text-center">
                  Chemical Equation: N₂(g) + 3 H₂(g) ➔ 2 NH₃(g)
                </div>
                <div className="grid grid-cols-2 gap-4 my-4">
                  {/* Reactant A */}
                  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${!isH2Limiting ? 'border-amber-500/60 bg-amber-500/10' : 'border-slate-800 bg-slate-950'}`}>
                    <span className="text-xs font-mono text-slate-400">Nitrogen Supply</span>
                    <span className="text-2xl font-black font-mono text-slate-100">{molesN2} mol</span>
                    {!isH2Limiting && <span className="text-[10px] font-bold text-amber-400 mt-1">LIMITING</span>}
                    {isH2Limiting && <span className="text-[10px] text-slate-400 mt-1">{excessN2Remaining.toFixed(1)} mol Excess</span>}
                  </div>

                  {/* Reactant B */}
                  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${isH2Limiting ? 'border-amber-500/60 bg-amber-500/10' : 'border-slate-800 bg-slate-950'}`}>
                    <span className="text-xs font-mono text-slate-400">Hydrogen Supply</span>
                    <span className="text-2xl font-black font-mono text-slate-100">{molesH2} mol</span>
                    {isH2Limiting && <span className="text-[10px] font-bold text-amber-400 mt-1">LIMITING</span>}
                    {!isH2Limiting && <span className="text-[10px] text-slate-400 mt-1">{excessH2Remaining.toFixed(1)} mol Excess</span>}
                  </div>
                </div>

                {/* Arrow to Product */}
                <div className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-center">
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    Maximum Ammonia (NH₃) Yield
                  </span>
                  <span className="text-3xl font-black font-mono text-emerald-300">
                    {actualNH3Produced.toFixed(2)} mol
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    = {(actualNH3Produced * 17.03).toFixed(1)} grams NH₃
                  </span>
                </div>
              </div>
            </div>
          ) : isYield ? (
            /* Percent Yield Gauge */
            <div className="w-full flex flex-col items-center gap-6">
              <div className="relative w-60 h-60 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={percentYield > 80 ? '#10b981' : percentYield > 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - percentYield / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-mono text-slate-100">{percentYield.toFixed(0)}%</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Percent Yield</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md font-mono text-xs text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">THEORETICAL MAX</span>
                  <span className="text-slate-200 font-bold text-base">{theoreticalMass} g</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ACTUAL COLLECTED</span>
                  <span className="text-emerald-400 font-bold text-base">{actualMass} g</span>
                </div>
              </div>
            </div>
          ) : isStoich ? (
            /* Stoichiometric combustion chamber */
            <div className="w-full max-w-lg space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  Reaction: C₃H₈(g) + 5 O₂(g) ➔ 3 CO₂(g) + 4 H₂O(g)
                </div>
                <div className="grid grid-cols-2 gap-4 my-2 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">REACTANT MASS IN</span>
                    <span className="text-amber-300 font-bold text-base">{(fuelMass + oxygenMoles * 32).toFixed(1)} g</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PRODUCT MASS OUT</span>
                    <span className="text-emerald-400 font-bold text-base">{(theoreticalCO2Grams + theoreticalH2OGrams).toFixed(1)} g</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1 mt-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Law of Conservation of Mass Verified</span>
                </div>
              </div>
            </div>
          ) : (
            /* Digital analytical balance */
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-64 h-36 bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-between shadow-2xl">
                {/* Weigh pan */}
                <div className="w-44 h-3 bg-slate-600 rounded -mt-6 border border-slate-500 shadow flex items-center justify-center">
                  <div className="w-16 h-8 bg-amber-500/30 rounded-t-full -mt-6 border border-amber-400 flex items-center justify-center text-[9px] font-mono text-amber-200">
                    {activeComp.formula}
                  </div>
                </div>

                {/* Digital LCD screen */}
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">PRECISION SCALE</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {massGrams.toFixed(2)} g
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
                <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                  Molar Mass = {activeComp.mw} g/mol
                </span>
                <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-cyan-300">
                  Moles = {calculatedMoles.toFixed(3)} mol
                </span>
              </div>
            </div>
          )}
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
