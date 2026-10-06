import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Atom, Zap, ArrowRight, RotateCcw } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface AtomicStructureSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

const ELEMENT_NAMES: Record<number, { sym: string; name: string; standardNeutrons: number }> = {
  1: { sym: 'H', name: 'Hydrogen', standardNeutrons: 0 },
  2: { sym: 'He', name: 'Helium', standardNeutrons: 2 },
  3: { sym: 'Li', name: 'Lithium', standardNeutrons: 4 },
  4: { sym: 'Be', name: 'Beryllium', standardNeutrons: 5 },
  5: { sym: 'B', name: 'Boron', standardNeutrons: 6 },
  6: { sym: 'C', name: 'Carbon', standardNeutrons: 6 },
  7: { sym: 'N', name: 'Nitrogen', standardNeutrons: 7 },
  8: { sym: 'O', name: 'Oxygen', standardNeutrons: 8 },
  9: { sym: 'F', name: 'Fluorine', standardNeutrons: 10 },
  10: { sym: 'Ne', name: 'Neon', standardNeutrons: 10 },
  11: { sym: 'Na', name: 'Sodium', standardNeutrons: 12 },
  12: { sym: 'Mg', name: 'Magnesium', standardNeutrons: 12 },
  13: { sym: 'Al', name: 'Aluminum', standardNeutrons: 14 },
  14: { sym: 'Si', name: 'Silicon', standardNeutrons: 14 },
  15: { sym: 'P', name: 'Phosphorus', standardNeutrons: 16 },
  16: { sym: 'S', name: 'Sulfur', standardNeutrons: 16 },
  17: { sym: 'Cl', name: 'Chlorine', standardNeutrons: 18 },
  18: { sym: 'Ar', name: 'Argon', standardNeutrons: 22 },
  19: { sym: 'K', name: 'Potassium', standardNeutrons: 20 },
  20: { sym: 'Ca', name: 'Calcium', standardNeutrons: 20 },
};

export const AtomicStructureSim: React.FC<AtomicStructureSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isBohr = metadata.id === 'chem-bohr-model' || metadata.id === 'chem-bohr-atom';
  const isConfig = metadata.id === 'chem-electron-config';
  const isIsotopes = metadata.id === 'chem-isotopes';
  const isEnergy = metadata.id === 'chem-energy-levels';

  // Atomic particles
  const protons = Math.round(values.protons ?? (values.atomicNumber ?? (values.selectedZ ?? 6)));
  const neutrons = Math.round(values.neutrons ?? ELEMENT_NAMES[protons]?.standardNeutrons ?? protons);
  const electrons = Math.round(values.electrons ?? (values.atomicNumber ?? protons));

  // Bohr quantum levels
  const nInitial = Math.round(values.nInitial ?? 3);
  const nFinal = Math.round(values.nFinal ?? 2);

  // Energy levels
  const zEff = values.effectiveCharge ?? 1;
  const nLevel = Math.round(values.quantumLevel ?? 1);

  // Isotope abundances
  const elemChoice = Math.round(values.elementChoice ?? 2); // 1:C, 2:Cl, 3:H, 4:O
  const ab1 = values.abundance1 ?? 76;
  const ab2 = 100 - ab1;

  const currentElement = ELEMENT_NAMES[protons] || { sym: 'X', name: 'Element', standardNeutrons: protons };
  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;

  // Quantum electron shell distribution (2, 8, 18...)
  const shell1 = Math.min(2, electrons);
  const shell2 = Math.min(8, Math.max(0, electrons - 2));
  const shell3 = Math.min(8, Math.max(0, electrons - 10));
  const shell4 = Math.min(2, Math.max(0, electrons - 18));

  // Bohr photon calculation
  const e1 = -13.6 / (nInitial * nInitial);
  const e2 = -13.6 / (nFinal * nFinal);
  const deltaE = Math.abs(e1 - e2);
  const wavelengthNm = deltaE > 0.01 ? (1240 / deltaE) : 0;
  const isEmission = nInitial > nFinal;

  const getSpectralColor = (wavelength: number) => {
    if (wavelength >= 380 && wavelength < 440) return { bg: '#8b5cf6', name: 'Violet' };
    if (wavelength >= 440 && wavelength < 490) return { bg: '#3b82f6', name: 'Blue' };
    if (wavelength >= 490 && wavelength < 560) return { bg: '#22c55e', name: 'Cyan / Green' };
    if (wavelength >= 560 && wavelength < 590) return { bg: '#eab308', name: 'Yellow' };
    if (wavelength >= 590 && wavelength < 625) return { bg: '#f97316', name: 'Orange' };
    if (wavelength >= 625 && wavelength <= 740) return { bg: '#ef4444', name: 'Red (Balmer H-α)' };
    if (wavelength < 380) return { bg: '#a855f7', name: 'Ultraviolet (Lyman)' };
    return { bg: '#dc2626', name: 'Infrared (Paschen)' };
  };

  const spectralInfo = getSpectralColor(wavelengthNm);

  // Electron configuration string
  const getElectronConfig = (count: number) => {
    let remaining = count;
    const subshells = [
      { name: '1s', cap: 2 },
      { name: '2s', cap: 2 },
      { name: '2p', cap: 6 },
      { name: '3s', cap: 2 },
      { name: '3p', cap: 6 },
      { name: '4s', cap: 2 },
    ];
    const parts: string[] = [];
    for (const sub of subshells) {
      if (remaining <= 0) break;
      const fill = Math.min(remaining, sub.cap);
      parts.push(`${sub.name}${fill > 1 ? `^${fill}` : '¹'}`);
      remaining -= fill;
    }
    return parts.join(' ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isBohr ? 'Bohr Quantum Transition' : isIsotopes ? 'Isotope Abundance' : 'Nuclide State'}
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>{currentElement.name}</span>
                <span className="text-indigo-400 font-bold">({currentElement.sym})</span>
                <span className="text-xs font-normal text-slate-400">Z = {protons}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Mass A = {massNumber}
            </span>
            <span className={`px-2.5 py-1 rounded-lg border font-bold ${
              netCharge === 0 ? 'bg-slate-950 border-slate-800 text-emerald-400' :
              netCharge > 0 ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' :
              'bg-purple-950/40 border-purple-800/60 text-purple-300'
            }`}>
              Charge = {netCharge > 0 ? `+${netCharge}` : netCharge === 0 ? 'Neutral (0)' : `${netCharge}`}
            </span>
            {isBohr && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                ΔE = {deltaE.toFixed(2)} eV (λ = {wavelengthNm.toFixed(0)} nm)
              </span>
            )}
          </div>
        </div>

        {/* Visual Canvas / Orbital Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {/* Atomic Orbital Model (SVG) */}
          <div className="relative w-80 h-80 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 320 320">
              {/* Concentric quantum electron shells */}
              <circle cx="160" cy="160" r="45" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="160" cy="160" r="75" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="160" cy="160" r="105" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="160" cy="160" r="135" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Shell labels */}
              <text x="160" y="110" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">n=1 (K)</text>
              <text x="160" y="80" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">n=2 (L)</text>
              <text x="160" y="50" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">n=3 (M)</text>
              <text x="160" y="20" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">n=4 (N)</text>

              {/* Dense Nucleus */}
              <circle cx="160" cy="160" r="24" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
              <text x="160" y="156" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {protons}P | {neutrons}N
              </text>
              <text x="160" y="170" fill="#a5b4fc" fontSize="9" textAnchor="middle" fontFamily="monospace">
                {currentElement.sym}
              </text>

              {/* Shell 1 electrons */}
              {Array.from({ length: shell1 }).map((_, i) => {
                const angle = (i / 2) * Math.PI * 2;
                return (
                  <circle
                    key={`s1-${i}`}
                    cx={160 + Math.cos(angle) * 45}
                    cy={160 + Math.sin(angle) * 45}
                    r="5"
                    fill="#38bdf8"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Shell 2 electrons */}
              {Array.from({ length: shell2 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <circle
                    key={`s2-${i}`}
                    cx={160 + Math.cos(angle) * 75}
                    cy={160 + Math.sin(angle) * 75}
                    r="5"
                    fill="#38bdf8"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Shell 3 electrons */}
              {Array.from({ length: shell3 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <circle
                    key={`s3-${i}`}
                    cx={160 + Math.cos(angle) * 105}
                    cy={160 + Math.sin(angle) * 105}
                    r="5"
                    fill="#38bdf8"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Shell 4 electrons */}
              {Array.from({ length: shell4 }).map((_, i) => {
                const angle = (i / 2) * Math.PI * 2;
                return (
                  <circle
                    key={`s4-${i}`}
                    cx={160 + Math.cos(angle) * 135}
                    cy={160 + Math.sin(angle) * 135}
                    r="5"
                    fill="#38bdf8"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Bohr Photon Transition Animation Arc */}
              {isBohr && deltaE > 0.05 && (
                <path
                  d={`M ${160 + 15 * nInitial},160 A 60,60 0 0,0 ${160 + 15 * nFinal},160`}
                  fill="none"
                  stroke={spectralInfo.bg}
                  strokeWidth="3"
                  strokeDasharray="4,4"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>

          {/* Atomic Information Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            {/* Nuclide Notation Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right font-mono text-xs font-bold leading-tight">
                  <span className="text-amber-400">{massNumber}</span>
                  <span className="text-cyan-400">{protons}</span>
                </div>
                <div className="text-3xl font-black font-mono text-slate-100">{currentElement.sym}</div>
                {netCharge !== 0 && (
                  <div className="text-sm font-bold font-mono text-purple-400">
                    {netCharge > 0 ? `${netCharge > 1 ? netCharge : ''}+` : `${Math.abs(netCharge) > 1 ? Math.abs(netCharge) : ''}-`}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-mono text-slate-400 text-right">
                <div>Protons: {protons}</div>
                <div>Neutrons: {neutrons}</div>
                <div>Electrons: {electrons}</div>
              </div>
            </div>

            {/* Electron Configuration */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Aufbau Electron Configuration
              </div>
              <div className="font-mono text-xs text-indigo-300 font-bold break-all">
                {getElectronConfig(electrons)}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Shell distribution: [{shell1}, {shell2}, {shell3}, {shell4}]
              </div>
            </div>

            {/* Bohr Spectral series or Isotope breakdown */}
            {isBohr ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Bohr Photon Transition (n₁={nInitial} → n₂={nFinal})
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow"
                    style={{ backgroundColor: spectralInfo.bg }}
                  />
                  <div className="text-xs font-mono text-slate-200">
                    {spectralInfo.name} ({wavelengthNm.toFixed(1)} nm)
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  {isEmission ? 'Photon emitted (downward jump)' : 'Photon absorbed (upward jump)'} with energy ΔE = {deltaE.toFixed(2)} eV.
                </div>
              </div>
            ) : isIsotopes ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Isotopic Mass Weighted Average
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Isotope 1: {ab1}% | Isotope 2: {ab2}%
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  Avg Mass = {((protons + neutrons) * (ab1 / 100) + (protons + neutrons + 2) * (ab2 / 100)).toFixed(2)} amu
                </div>
              </div>
            ) : null}

            {/* Theory takeaway */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
              <div className="text-slate-400 font-mono text-[10px] uppercase">Governing Physics</div>
              <div className="font-mono text-indigo-300 font-bold">
                {isBohr ? 'ΔE = |E_f - E_i| = hc / λ' : 'Z = Protons | A = P + N'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isBohr
                  ? 'Discrete quantum jumps produce the unique spectral fingerprints of elements.'
                  : 'Protons dictate the element identity; electrons dictate chemical bonding.'}
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
