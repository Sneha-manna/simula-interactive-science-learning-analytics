import React, { useState } from 'react';
import { Share2, Zap, Shield, Sparkles, Compass } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface ChemicalBondingSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const ChemicalBondingSim: React.FC<ChemicalBondingSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isIonic = metadata.id === 'chem-ionic-bonding';
  const isCovalent = metadata.id === 'chem-covalent-bonding';
  const isLewis = metadata.id === 'chem-lewis-structures';
  const isGeometry = metadata.id === 'chem-molecular-geometry';
  const isPolarity = metadata.id === 'chem-polarity';

  // Ionic params
  const cationCharge = values.cationCharge ?? 1;
  const anionCharge = values.anionCharge ?? 1;
  const separationDistance = values.distance ?? 280; // pm
  // Coulomb lattice energy ~ (q1 * q2) / r
  const latticeEnergy = Math.round((1400 * cationCharge * anionCharge) / (separationDistance / 200));

  // Covalent params
  const rDistance = values.internuclearDistance ?? 74; // pm
  // Lennard-Jones style potential: E = 4 * epsilon * [(sigma/r)^12 - (sigma/r)^6]
  const sigma = 70;
  const rRatio = sigma / Math.max(30, rDistance);
  const potentialEnergy = Math.min(600, Math.round(436 * (Math.pow(rRatio, 12) - 2 * Math.pow(rRatio, 6))));

  // Lewis / Geometry params
  const molIndex = Math.round(values.moleculeIndex ?? (values.moleculeType ?? 1));
  const bondedAtoms = Math.round(values.bondedAtoms ?? 2);
  const lonePairs = Math.round(values.lonePairs ?? 2);
  const electricField = Math.round(values.externalField ?? 0);

  // Molecule presets
  const MOLECULES: Record<number, { name: string; formula: string; shape: string; angle: string; polar: boolean; lewis: string }> = {
    1: { name: 'Water', formula: 'H₂O', shape: 'Bent', angle: '104.5°', polar: true, lewis: 'H - Ö̈ - H' },
    2: { name: 'Carbon Dioxide', formula: 'CO₂', shape: 'Linear', angle: '180.0°', polar: false, lewis: 'Ö = C = Ö' },
    3: { name: 'Methane', formula: 'CH₄', shape: 'Tetrahedral', angle: '109.5°', polar: false, lewis: 'H - C(H)₂ - H' },
    4: { name: 'Ammonia', formula: 'NH₃', shape: 'Trigonal Pyramidal', angle: '107.0°', polar: true, lewis: 'H - N̈(H) - H' },
    5: { name: 'Nitrogen Gas', formula: 'N₂', shape: 'Linear', angle: '180.0°', polar: false, lewis: ':N ≡ N:' },
  };

  const selectedMol = MOLECULES[molIndex] || MOLECULES[1];

  // Derive geometry from steric number
  const stericNumber = bondedAtoms + lonePairs;
  let computedShape = 'Linear';
  let computedAngle = '180°';
  if (stericNumber === 2) {
    computedShape = 'Linear';
    computedAngle = '180°';
  } else if (stericNumber === 3) {
    computedShape = lonePairs === 0 ? 'Trigonal Planar' : 'Bent';
    computedAngle = lonePairs === 0 ? '120°' : '117°';
  } else if (stericNumber === 4) {
    if (lonePairs === 0) {
      computedShape = 'Tetrahedral';
      computedAngle = '109.5°';
    } else if (lonePairs === 1) {
      computedShape = 'Trigonal Pyramidal';
      computedAngle = '107.0°';
    } else {
      computedShape = 'Bent';
      computedAngle = '104.5°';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isIonic ? 'Ionic Crystal Lattice' : isCovalent ? 'Covalent Potential Well' : isGeometry ? 'VSEPR Spatial Geometry' : 'Chemical Bonding Model'}
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>{isIonic ? `Cation (+${cationCharge}) & Anion (-${anionCharge})` : isGeometry ? computedShape : selectedMol.name}</span>
                <span className="text-xs font-normal text-slate-400">
                  {isGeometry ? `Bond Angle: ${computedAngle}` : selectedMol.formula}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            {isIonic && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
                Lattice Energy ≈ {latticeEnergy} kJ/mol
              </span>
            )}
            {isCovalent && (
              <span className={`px-2.5 py-1 rounded-lg border font-bold ${
                potentialEnergy < 0 ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' : 'bg-red-950/40 border-red-800/60 text-red-400'
              }`}>
                Potential Energy = {potentialEnergy} kJ/mol
              </span>
            )}
            {(isGeometry || isPolarity || isLewis) && (
              <span className={`px-2.5 py-1 rounded-lg border font-bold ${
                selectedMol.polar ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                {selectedMol.polar ? 'Polar Molecule (Net Dipole μ > 0)' : 'Nonpolar (Symmetric Cancellation μ = 0)'}
              </span>
            )}
          </div>
        </div>

        {/* Visual Apparatus Canvas */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col items-center justify-center min-h-[420px]">
          {isIonic ? (
            /* Ionic electron transfer visualizer */
            <div className="flex flex-col items-center gap-8 w-full">
              <div className="flex items-center justify-center gap-16 relative py-12">
                {/* Cation */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 border-2 border-amber-300">
                    +{cationCharge}
                  </div>
                  <span className="text-xs font-mono text-slate-400 mt-2">Cation (Lost e⁻)</span>
                </div>

                {/* Electrostatic Coulomb Attraction Lines */}
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Coulomb Force</div>
                  <div className="flex items-center gap-1 text-cyan-400 animate-pulse">
                    <span>➔</span>
                    <span className="font-mono text-xs text-slate-200">{separationDistance} pm</span>
                    <span>Stock</span>
                  </div>
                  <div className="w-28 h-0.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-400" />
                </div>

                {/* Anion */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-slate-100 font-black text-2xl shadow-lg shadow-indigo-500/20 border-2 border-indigo-300">
                    -{anionCharge}
                  </div>
                  <span className="text-xs font-mono text-slate-400 mt-2">Anion (Gained e⁻)</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 text-center max-w-lg">
                <span className="text-amber-400 font-bold">Coulomb’s Law:</span> Force F = (k · |q₁ · q₂|) / r². As ion charge increases from +1/-1 to +2/-2 (like MgO), lattice energy quadruples, yielding extremely high melting points.
              </div>
            </div>
          ) : isCovalent ? (
            /* Covalent potential energy curve */
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-md h-56 relative bg-slate-900/40 rounded-xl border border-slate-800 p-4 flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 120">
                  {/* Axis */}
                  <line x1="20" y1="60" x2="190" y2="60" stroke="#475569" strokeDasharray="2,2" strokeWidth="1" />
                  <line x1="20" y1="10" x2="20" y2="110" stroke="#475569" strokeWidth="1" />
                  <text x="25" y="15" fill="#94a3b8" fontSize="8" fontFamily="monospace">Energy (kJ/mol)</text>
                  <text x="140" y="55" fill="#94a3b8" fontSize="8" fontFamily="monospace">Distance r (pm)</text>

                  {/* Lennard-Jones Potential Curve */}
                  <path
                    d="M 30,10 Q 38,95 65,100 T 110,65 Q 150,60 190,60"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />

                  {/* Minimum energy well line */}
                  <line x1="65" y1="60" x2="65" y2="100" stroke="#10b981" strokeDasharray="2,2" strokeWidth="1" />
                  <text x="68" y="115" fill="#10b981" fontSize="7" fontFamily="monospace">r₀ = 74 pm (H₂)</text>

                  {/* Active slider point */}
                  <circle
                    cx={Math.min(185, Math.max(30, 20 + (rDistance / 250) * 165))}
                    cy={Math.min(105, Math.max(15, 60 - (potentialEnergy / 500) * 40))}
                    r="5"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* Two Atoms Overlap Simulation */}
              <div className="flex items-center justify-center my-6 relative" style={{ width: `${Math.max(120, rDistance * 1.5)}px` }}>
                <div className="w-16 h-16 rounded-full bg-cyan-500/50 border-2 border-cyan-400 flex items-center justify-center text-xs font-mono font-bold text-white shadow-lg">
                  H
                </div>
                <div className="w-16 h-16 rounded-full bg-cyan-500/50 border-2 border-cyan-400 flex items-center justify-center text-xs font-mono font-bold text-white shadow-lg -ml-6">
                  H
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Internuclear distance: {rDistance} pm | State: {rDistance < 60 ? 'Nuclear Repulsion Dominates' : rDistance <= 85 ? 'Stable Covalent Bond Minimum' : 'Separated Weak Attraction'}
              </span>
            </div>
          ) : (
            /* VSEPR & Lewis Molecular 3D Simulation */
            <div className="flex flex-col items-center justify-center gap-6 w-full">
              {/* Central atom with bonded ligands */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Central Atom */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-2xl border-2 border-cyan-300 z-10">
                  {selectedMol.formula.includes('C') ? 'C' : selectedMol.formula.includes('N') ? 'N' : 'O'}
                </div>

                {/* Ligand 1 */}
                <div className="absolute top-4 left-12 w-12 h-12 rounded-full bg-slate-200 text-slate-950 font-bold flex items-center justify-center text-sm shadow border border-white">
                  H
                </div>
                <div className="absolute top-12 left-20 w-12 h-1 bg-cyan-400/80 -rotate-45" />

                {/* Ligand 2 */}
                <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-slate-200 text-slate-950 font-bold flex items-center justify-center text-sm shadow border border-white">
                  {selectedMol.formula.includes('CO₂') ? 'O' : 'H'}
                </div>
                <div className="absolute top-12 right-20 w-12 h-1 bg-cyan-400/80 rotate-45" />

                {/* Ligand 3 if 3 or 4 bonded */}
                {bondedAtoms >= 3 && (
                  <>
                    <div className="absolute bottom-6 left-12 w-12 h-12 rounded-full bg-slate-200 text-slate-950 font-bold flex items-center justify-center text-sm shadow border border-white">
                      H
                    </div>
                    <div className="absolute bottom-14 left-20 w-12 h-1 bg-cyan-400/80 rotate-45" />
                  </>
                )}

                {/* Ligand 4 if 4 bonded */}
                {bondedAtoms >= 4 && (
                  <>
                    <div className="absolute bottom-6 right-12 w-12 h-12 rounded-full bg-slate-200 text-slate-950 font-bold flex items-center justify-center text-sm shadow border border-white">
                      H
                    </div>
                    <div className="absolute bottom-14 right-20 w-12 h-1 bg-cyan-400/80 -rotate-45" />
                  </>
                )}

                {/* Lone Pair Clouds if present */}
                {lonePairs > 0 && (
                  <div className="absolute -top-4 w-12 h-8 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-400/10 flex items-center justify-center text-amber-300 font-bold text-xs">
                    ••
                  </div>
                )}
                {lonePairs > 1 && (
                  <div className="absolute -bottom-4 w-12 h-8 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-400/10 flex items-center justify-center text-amber-300 font-bold text-xs">
                    ••
                  </div>
                )}

                {/* Electric field orientation indicator */}
                {isPolarity && electricField === 1 && (
                  <div className="absolute inset-0 border-2 border-cyan-500/40 rounded-full animate-ping pointer-events-none" />
                )}
              </div>

              {/* Lewis Structure & Geometry Cards */}
              <div className="flex items-center gap-4 flex-wrap justify-center font-mono text-xs">
                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                  <span className="text-slate-400">Lewis Form: </span>
                  <span className="text-cyan-300 font-bold">{selectedMol.lewis}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                  <span className="text-slate-400">Bond Angle: </span>
                  <span className="text-emerald-400 font-bold">{isGeometry ? computedAngle : selectedMol.angle}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                  <span className="text-slate-400">Steric Number: </span>
                  <span className="text-purple-400 font-bold">{stericNumber}</span>
                </div>
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
