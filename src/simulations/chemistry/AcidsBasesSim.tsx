import React, { useState, useEffect } from 'react';
import { FlaskConical, Droplet, RotateCcw, Plus, Minus, TestTube, ArrowRight } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface AcidsBasesSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const AcidsBasesSim: React.FC<AcidsBasesSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isTitration = metadata.id === 'chem-titration';
  const isNeutralization = metadata.id === 'chem-neutralization';
  const isStrongWeak = metadata.id === 'chem-strong-weak-acids';
  const isDilution = metadata.id === 'chem-ph-dilution';
  // Default is chem-ph-scale

  // pH scale variables
  const targetPh = values.ph ?? 7.0;
  const beakerVol = values.volume ?? 0.5;

  // Titration / Neutralization variables
  const acidConc = values.acidConc ?? 0.1;
  const acidVol = values.acidVol ?? 50; // mL
  const baseConc = values.baseConc ?? 0.1;
  const addedBaseVol = values.addedVolume ?? (values.baseVol ?? 25); // mL

  // Strong vs Weak variables
  const acidType = values.acidType ?? 2; // 1:HCl (strong), 2:CH3COOH (Ka=1.8e-5), 3:HF (Ka=6.8e-4), 4:HCOOH (Ka=1.8e-4)
  const weakConc = values.concentration ?? 0.1;

  // Dilution variables
  const initConc = values.initialConc ?? 0.5;
  const initVol = values.initialVol ?? 50; // mL
  const addedWater = values.addedWater ?? 450; // mL

  // Compute active pH and concentrations
  let activePh = 7.0;
  let label = 'Neutral Water';
  let activeHConc = 1e-7;
  let activeOHConc = 1e-7;

  if (isTitration || isNeutralization) {
    const molesH = (acidConc * acidVol) / 1000;
    const molesOH = (baseConc * addedBaseVol) / 1000;
    const totalVolL = (acidVol + addedBaseVol) / 1000;

    if (Math.abs(molesH - molesOH) < 1e-7) {
      activePh = 7.0;
      label = 'Equivalence Point (Neutral)';
    } else if (molesH > molesOH) {
      const excessH = (molesH - molesOH) / totalVolL;
      activePh = Math.max(0, -Math.log10(Math.max(1e-14, excessH)));
      label = 'Acidic Region (Excess H⁺)';
    } else {
      const excessOH = (molesOH - molesH) / totalVolL;
      const pOH = Math.max(0, -Math.log10(Math.max(1e-14, excessOH)));
      activePh = Math.min(14, 14 - pOH);
      label = 'Basic Region (Excess OH⁻)';
    }
    activeHConc = Math.pow(10, -activePh);
    activeOHConc = Math.pow(10, -(14 - activePh));
  } else if (isStrongWeak) {
    if (acidType === 1) {
      // Strong HCl -> complete dissociation
      activePh = Math.max(0, -Math.log10(Math.max(1e-14, weakConc)));
      label = 'Hydrochloric Acid (HCl - Strong, 100% dissociated)';
      activeHConc = weakConc;
    } else {
      // Weak acid
      const Ka = acidType === 2 ? 1.8e-5 : acidType === 3 ? 6.8e-4 : 1.8e-4;
      const name = acidType === 2 ? 'Acetic Acid (CH₃COOH)' : acidType === 3 ? 'Hydrofluoric Acid (HF)' : 'Formic Acid (HCOOH)';
      // [H+] = sqrt(Ka * C)
      activeHConc = Math.sqrt(Ka * weakConc);
      activePh = -Math.log10(Math.max(1e-14, activeHConc));
      const alphaPercent = ((activeHConc / weakConc) * 100).toFixed(2);
      label = `${name} (Weak, ${alphaPercent}% ionized)`;
    }
    activeOHConc = 1e-14 / Math.max(1e-14, activeHConc);
  } else if (isDilution) {
    const totalVol = initVol + addedWater;
    const dilutedConc = (initConc * initVol) / totalVol;
    // Approximating monoprotic acid
    activeHConc = Math.max(1e-7, dilutedConc);
    activePh = -Math.log10(activeHConc);
    activeOHConc = 1e-14 / activeHConc;
    label = `Diluted Solution (${dilutedConc.toFixed(4)} M)`;
  } else {
    // chem-ph-scale
    activePh = targetPh;
    activeHConc = Math.pow(10, -activePh);
    activeOHConc = Math.pow(10, -(14 - activePh));
    if (activePh < 3) label = 'Strong Acid (e.g. Battery Acid, Gastric Juice)';
    else if (activePh < 6) label = 'Weak Acid (e.g. Coffee, Orange Juice, Rain)';
    else if (activePh <= 7.5) label = 'Neutral (Pure Water, Blood)';
    else if (activePh < 11) label = 'Mild Base (Baking Soda, Sea Water, Soap)';
    else label = 'Strong Base (Bleach, Liquid Drain Cleaner)';
  }

  // Universal indicator color scheme
  const getIndicatorColor = (ph: number) => {
    if (ph <= 1) return '#ef4444'; // Red
    if (ph <= 3) return '#f97316'; // Orange-red
    if (ph <= 5) return '#eab308'; // Yellow
    if (ph <= 7) return '#22c55e'; // Green
    if (ph <= 9) return '#06b6d4'; // Cyan
    if (ph <= 11) return '#3b82f6'; // Blue
    return '#a855f7'; // Purple
  };

  const currentColor = getIndicatorColor(activePh);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border transition-colors duration-300"
              style={{ backgroundColor: `${currentColor}20`, borderColor: `${currentColor}50`, color: currentColor }}
            >
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Aqueous Solution Status
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>pH =</span>
                <span style={{ color: currentColor }}>{activePh.toFixed(2)}</span>
                <span className="text-xs font-medium text-slate-400">({label})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              [H⁺] = {activeHConc.toExponential(2)} M
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              [OH⁻] = {activeOHConc.toExponential(2)} M
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              pOH = {(14 - activePh).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Visual Lab Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {/* Beaker / Flask apparatus */}
          <div className="flex flex-col items-center">
            {isTitration && (
              <div className="flex flex-col items-center mb-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Burette (0.1 M NaOH Titrant)
                </div>
                <div className="w-6 h-28 border-2 border-slate-600 rounded-t bg-slate-900/60 relative flex flex-col justify-end overflow-hidden">
                  <div
                    className="w-full bg-blue-500/40 transition-all duration-300"
                    style={{ height: `${Math.max(10, 100 - (addedBaseVol / 50) * 100)}%` }}
                  />
                  <div className="absolute inset-0 flex flex-col justify-between py-1 px-0.5 pointer-events-none">
                    <span className="text-[8px] font-mono text-slate-500">0</span>
                    <span className="text-[8px] font-mono text-slate-500">25</span>
                    <span className="text-[8px] font-mono text-slate-500">50</span>
                  </div>
                </div>
                {/* Dropper tip */}
                <div className="w-1.5 h-3 bg-slate-600 mb-1" />
                <div className="flex items-center gap-1 text-cyan-400 animate-bounce">
                  <Droplet className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Glass Beaker */}
            <div className="relative w-52 h-64 border-x-4 border-b-4 border-slate-700/80 rounded-b-3xl bg-slate-900/30 overflow-hidden shadow-inner flex flex-col justify-end">
              {/* Solution Fluid */}
              <div
                className="w-full transition-all duration-500 relative flex items-center justify-center"
                style={{
                  height: isTitration ? `${Math.min(95, 40 + (addedBaseVol / 50) * 45)}%` : `${Math.min(90, beakerVol * 90)}%`,
                  backgroundColor: currentColor,
                  opacity: 0.75,
                }}
              >
                {/* Floating Ion Particles */}
                <div className="absolute inset-0 overflow-hidden flex flex-wrap items-center justify-around p-3 pointer-events-none opacity-80">
                  {Array.from({ length: Math.min(18, Math.max(4, Math.round(14 - activePh + 3))) }).map((_, i) => (
                    <span key={`h-${i}`} className="text-[10px] font-bold font-mono text-white/90 bg-red-900/60 px-1 rounded-full m-0.5">
                      H⁺
                    </span>
                  ))}
                  {Array.from({ length: Math.min(18, Math.max(4, Math.round(activePh + 2))) }).map((_, i) => (
                    <span key={`oh-${i}`} className="text-[10px] font-bold font-mono text-white/90 bg-blue-900/60 px-1 rounded-full m-0.5">
                      OH⁻
                    </span>
                  ))}
                </div>

                {/* Submerged pH probe */}
                <div className="absolute top-0 w-3 h-28 bg-gradient-to-b from-slate-400 to-slate-200 border border-slate-600 rounded-b shadow-lg -mt-10" />
              </div>

              {/* Volume graduation lines on beaker */}
              <div className="absolute left-2 inset-y-4 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-slate-500">
                <span>500 mL</span>
                <span>400 mL</span>
                <span>300 mL</span>
                <span>200 mL</span>
                <span>100 mL</span>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-400 mt-2">
              Analyte Solution (Total Vol: {isTitration || isNeutralization ? (acidVol + addedBaseVol).toFixed(0) : isDilution ? (initVol + addedWater).toFixed(0) : (beakerVol * 1000).toFixed(0)} mL)
            </span>
          </div>

          {/* pH Indicator Strip & Legend */}
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Universal pH Scale</span>
                <span className="font-bold text-slate-200">{activePh.toFixed(1)}</span>
              </div>
              <div className="h-6 rounded-lg w-full flex overflow-hidden border border-slate-700 shadow-inner relative">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((step) => (
                  <div
                    key={step}
                    className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: getIndicatorColor(step) }}
                    onClick={() => {
                      if (!isTitration && !isNeutralization) {
                        setValue('ph', step);
                        incrementRunCount();
                      }
                    }}
                    title={`pH ${step}`}
                  />
                ))}
                {/* Active marker needle */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white border border-black shadow-lg transition-all duration-300"
                  style={{ left: `calc(${(activePh / 14) * 100}% - 3px)` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>0 (Acid)</span>
                <span>7 (Neutral)</span>
                <span>14 (Base)</span>
              </div>
            </div>

            {/* Titration Curve Mini-Plot */}
            {(isTitration || isNeutralization) && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Titration Curve Sigmoid
                </div>
                <div className="h-28 w-full bg-slate-950 border border-slate-800 rounded-lg p-2 relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Equivalence guide line */}
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#475569" strokeDasharray="2,2" strokeWidth="1" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#475569" strokeDasharray="2,2" strokeWidth="1" />

                    {/* S-curve path */}
                    <path
                      d="M 0,90 Q 35,85 45,70 T 50,50 T 55,30 Q 65,15 100,10"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                    />

                    {/* Current point */}
                    <circle
                      cx={Math.min(100, Math.max(0, (addedBaseVol / 50) * 100))}
                      cy={100 - (activePh / 14) * 100}
                      r="4"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                  <span>0 mL NaOH</span>
                  <span className="text-cyan-400">Equiv: 25 mL</span>
                  <span>50 mL</span>
                </div>
              </div>
            )}

            {/* Formula card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
              <div className="text-slate-400 font-mono text-[10px] uppercase">Governing Equation</div>
              <div className="font-mono text-cyan-300 font-bold">
                {isTitration || isNeutralization
                  ? 'H⁺(aq) + OH⁻(aq) ⇌ H₂O(l)'
                  : isStrongWeak
                  ? 'Ka = [H⁺][A⁻] / [HA]'
                  : isDilution
                  ? 'M₁V₁ = M₂V₂'
                  : 'pH = -log₁₀[H⁺] | Kw = 10⁻¹⁴'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isTitration
                  ? 'Sigmoidal inflection occurs when moles of base equal moles of acid.'
                  : isStrongWeak
                  ? 'Weak acids only partially ionize in water, establishing dynamic equilibrium.'
                  : isDilution
                  ? 'Adding water decreases [H⁺] concentration, shifting pH toward neutrality.'
                  : 'Each 1.0 step on the pH scale represents a 10-fold change in [H⁺] ion concentration.'}
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
