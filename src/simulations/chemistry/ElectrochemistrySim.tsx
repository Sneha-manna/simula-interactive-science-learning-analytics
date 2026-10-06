import React, { useState } from 'react';
import { Zap, ArrowRight, BatteryCharging, Gauge, RotateCcw } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface ElectrochemistrySimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const ElectrochemistrySim: React.FC<ElectrochemistrySimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isElectrolysis = metadata.id === 'chem-electrolysis';
  const isNernst = metadata.id === 'chem-nernst-equation';
  const isRedox = metadata.id === 'chem-redox';
  // Default is chem-galvanic-cell

  // Galvanic / Daniell Cell Parameters
  // Zn(s) | Zn2+(aq) || Cu2+(aq) | Cu(s)
  // E°(Zn2+/Zn) = -0.76 V, E°(Cu2+/Cu) = +0.34 V => E°cell = 1.10 V
  const concZn = values.concAnode ?? (values.concZn ?? 1.0); // Anode [Zn²⁺]
  const concCu = values.concCathode ?? (values.concCu ?? 1.0); // Cathode [Cu²⁺]
  const temperature = values.temperature ?? 298; // K

  // Nernst Equation: E_cell = E°_cell - (RT / nF) * ln(Q)
  // At 298K: E_cell = 1.10 - (0.0592 / 2) * log10([Zn²⁺] / [Cu²⁺])
  const Q = Math.max(0.001, concZn) / Math.max(0.001, concCu);
  const E_standard = 1.10;
  const n = 2; // 2 electrons transferred
  const RT_nF = (8.314 * temperature) / (n * 96485);
  const cellVoltage = E_standard - RT_nF * Math.log(Q);

  // Electrolysis parameters (Faraday's Law: m = (I * t * M) / (n * F))
  const currentAmps = values.currentAmps ?? 2.0;
  const timeMinutes = values.timeMinutes ?? 15;
  const totalChargeCoulombs = currentAmps * (timeMinutes * 60);
  const faradayConstant = 96485;
  const molesElectrons = totalChargeCoulombs / faradayConstant;
  // Copper plating: Cu²⁺ + 2e⁻ -> Cu(s) (M = 63.55 g/mol)
  const platedCopperGrams = (molesElectrons / 2) * 63.55;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isElectrolysis ? 'Electrolytic Cell Plating' : 'Electrochemical Cell Voltage'}
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>{isElectrolysis ? 'Plated Mass =' : 'EMF E_cell ='}</span>
                <span className="text-amber-400 font-bold">
                  {isElectrolysis ? `${platedCopperGrams.toFixed(3)} g Cu` : `${cellVoltage.toFixed(3)} V`}
                </span>
                <span className="text-xs font-normal text-slate-400">
                  {isElectrolysis ? `(${currentAmps} A · ${timeMinutes} min)` : `(E° = +1.100 V)`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            {isElectrolysis ? (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  Q = {totalChargeCoulombs.toFixed(0)} C
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                  e⁻ Moles = {molesElectrons.toFixed(4)} mol
                </span>
              </>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  [Zn²⁺] = {concZn.toFixed(2)} M
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  [Cu²⁺] = {concCu.toFixed(2)} M
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                  Spontaneous (ΔG &lt; 0)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Visual Lab Apparatus Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {/* Electrochemical Daniell Cell Schematic */}
          <div className="relative flex items-center justify-center gap-10">
            {/* Anode Half-Cell (Zinc) */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono text-slate-400 mb-1">Anode (-) Oxidation</span>
              <div className="relative w-36 h-48 border-x-4 border-b-4 border-slate-700 rounded-b-2xl bg-slate-900/30 overflow-hidden flex flex-col justify-end">
                {/* Solution */}
                <div className="w-full h-32 bg-slate-800/60 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-slate-400">1.0 M ZnSO₄</span>
                </div>
                {/* Zinc Electrode bar */}
                <div className="absolute top-2 left-12 w-6 h-36 bg-slate-400 border border-slate-300 rounded shadow-md flex items-center justify-center">
                  <span className="text-[10px] font-bold font-mono text-slate-900 -rotate-90">Zn(s)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 mt-1">Zn ➔ Zn²⁺ + 2e⁻</span>
            </div>

            {/* Salt Bridge Tube & Voltmeter */}
            <div className="flex flex-col items-center -mt-8">
              {/* Digital Voltmeter */}
              <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-2.5 shadow-xl flex flex-col items-center mb-4">
                <span className="text-[9px] font-mono text-slate-400">DIGITAL VOLTMETER</span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  {cellVoltage.toFixed(3)} V
                </span>
              </div>

              {/* Salt bridge inverted U-tube */}
              <div className="w-24 h-16 border-t-8 border-x-8 border-amber-500/40 rounded-t-xl bg-transparent flex items-center justify-center">
                <span className="text-[9px] font-mono text-amber-300">KNO₃ Salt Bridge</span>
              </div>
              <div className="text-[10px] font-mono text-cyan-400 animate-pulse mt-2">
                e⁻ Flow ➔➔➔
              </div>
            </div>

            {/* Cathode Half-Cell (Copper) */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono text-slate-400 mb-1">Cathode (+) Reduction</span>
              <div className="relative w-36 h-48 border-x-4 border-b-4 border-slate-700 rounded-b-2xl bg-slate-900/30 overflow-hidden flex flex-col justify-end">
                {/* Solution */}
                <div className="w-full h-32 bg-blue-600/40 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-blue-200">1.0 M CuSO₄</span>
                </div>
                {/* Copper Electrode bar */}
                <div className="absolute top-2 left-12 w-6 h-36 bg-amber-600 border border-amber-400 rounded shadow-md flex items-center justify-center">
                  <span className="text-[10px] font-bold font-mono text-white -rotate-90">Cu(s)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 mt-1">Cu²⁺ + 2e⁻ ➔ Cu</span>
            </div>
          </div>

          {/* Theoretical Breakdown Panel */}
          <div className="w-full md:w-64 space-y-4 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Cell Potential Thermodynamics
              </span>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">E°(Cathode):</span>
                <span className="text-cyan-300 font-bold">+0.34 V (Cu²⁺/Cu)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">E°(Anode):</span>
                <span className="text-amber-300 font-bold">-0.76 V (Zn²⁺/Zn)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">E°_cell:</span>
                <span className="text-emerald-400 font-bold">+1.10 V</span>
              </div>
            </div>

            {/* Governing Equation */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Nernst Formula</span>
              <span className="text-cyan-300 font-bold block text-sm">
                E = E° - (0.0592 / n) · log₁₀(Q)
              </span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                As reactants are consumed and product [Zn²⁺] accumulates, Q increases and cell potential drops to 0.0V (dead battery at equilibrium).
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
