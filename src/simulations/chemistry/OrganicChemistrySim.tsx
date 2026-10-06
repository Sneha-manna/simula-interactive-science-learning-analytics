import React, { useState } from 'react';
import { Layers, Dna, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface OrganicChemistrySimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const OrganicChemistrySim: React.FC<OrganicChemistrySimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isFuncGroups = metadata.id === 'chem-functional-groups';
  const isIsomers = metadata.id === 'chem-isomers';
  const isPolymer = metadata.id === 'chem-polymerization';
  const isReactions = metadata.id === 'chem-organic-reactions';

  // Hydrocarbon carbon chain length
  const carbonCount = Math.max(1, Math.min(10, Math.round(values.carbonCount ?? (values.carbons ?? 4))));
  const bondType = Math.round(values.bondType ?? 1); // 1: Alkane (single), 2: Alkene (double), 3: Alkyne (triple)

  // Functional Group selection
  const groupIndex = Math.round(values.groupIndex ?? (values.functionalGroup ?? 1));
  const GROUPS: Record<number, { name: string; formula: string; group: string; suffix: string; example: string }> = {
    1: { name: 'Alcohol', formula: 'R - OH', group: 'Hydroxyl (-OH)', suffix: '-ol', example: 'Ethanol (CH₃CH₂OH)' },
    2: { name: 'Carboxylic Acid', formula: 'R - COOH', group: 'Carboxyl (-COOH)', suffix: '-oic acid', example: 'Acetic acid (CH₃COOH)' },
    3: { name: 'Ester', formula: 'R - COO - R\'', group: 'Ester (-COO-)', suffix: '-oate', example: 'Ethyl ethanoate' },
    4: { name: 'Amine', formula: 'R - NH₂', group: 'Amino (-NH₂)', suffix: '-amine', example: 'Methylamine (CH₃NH₂)' },
    5: { name: 'Aldehyde', formula: 'R - CHO', group: 'Carbonyl (-CHO)', suffix: '-al', example: 'Ethanal (CH₃CHO)' },
    6: { name: 'Ketone', formula: 'R - CO - R\'', group: 'Carbonyl (-CO-)', suffix: '-one', example: 'Propanone (Acetone)' },
  };
  const activeGroup = GROUPS[groupIndex] || GROUPS[1];

  // Hydrocarbon formula derivation
  const prefix = ['Meth', 'Eth', 'Prop', 'But', 'Pent', 'Hex', 'Hept', 'Oct', 'Non', 'Dec'][carbonCount - 1] || 'Poly';
  const suffix = bondType === 1 ? 'ane' : bondType === 2 ? 'ene' : 'yne';
  const moleculeName = `${prefix}${suffix}`;
  const hydrogenCount = bondType === 1 ? 2 * carbonCount + 2 : bondType === 2 ? 2 * carbonCount : 2 * carbonCount - 2;
  const molecularWeight = (carbonCount * 12.011 + hydrogenCount * 1.008).toFixed(2);
  const estimatedBoilingPoint = (-160 + (carbonCount - 1) * 30).toFixed(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isFuncGroups ? 'Organic Functional Family' : isPolymer ? 'Addition Polymerization' : 'Organic Hydrocarbon Structure'}
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>{isFuncGroups ? activeGroup.name : moleculeName}</span>
                <span className="text-xs font-normal text-teal-400">
                  {isFuncGroups ? activeGroup.formula : `C${carbonCount}H${hydrogenCount}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Molar Mass = {molecularWeight} g/mol
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
              Est. B.P. ≈ {estimatedBoilingPoint}°C
            </span>
          </div>
        </div>

        {/* Visual Molecule Canvas Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col items-center justify-center min-h-[420px]">
          {/* Carbon Backbone Visualizer */}
          <div className="w-full flex flex-col items-center gap-8">
            <div className="flex items-center justify-center gap-2 p-6 overflow-x-auto max-w-full">
              {Array.from({ length: carbonCount }).map((_, i) => (
                <React.Fragment key={`carbon-${i}`}>
                  {/* Carbon Atom Node */}
                  <div className="flex flex-col items-center">
                    {/* Top Hydrogens */}
                    <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold text-xs flex items-center justify-center shadow">
                      H
                    </div>
                    <div className="w-0.5 h-3 bg-slate-600 my-0.5" />

                    {/* Central Carbon */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border-2 border-teal-400 text-teal-300 font-black flex items-center justify-center shadow-lg font-mono">
                      C
                    </div>

                    {/* Bottom Hydrogens */}
                    <div className="w-0.5 h-3 bg-slate-600 my-0.5" />
                    <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold text-xs flex items-center justify-center shadow">
                      H
                    </div>
                  </div>

                  {/* Inter-Carbon Bonds */}
                  {i < carbonCount - 1 && (
                    <div className="flex flex-col justify-center gap-1">
                      <div className="w-6 h-1 bg-teal-400 rounded" />
                      {bondType >= 2 && <div className="w-6 h-1 bg-teal-400 rounded" />}
                      {bondType === 3 && <div className="w-6 h-1 bg-teal-400 rounded" />}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Molecule Properties Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-xl font-mono text-xs text-center">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">HOMOLOGOUS SERIES</span>
                <span className="text-teal-300 font-bold text-sm">
                  {bondType === 1 ? 'Alkane (Saturated)' : bondType === 2 ? 'Alkene (Unsaturated)' : 'Alkyne (Unsaturated)'}
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">GENERAL FORMULA</span>
                <span className="text-slate-200 font-bold text-sm">
                  {bondType === 1 ? 'C_n H_{2n+2}' : bondType === 2 ? 'C_n H_{2n}' : 'C_n H_{2n-2}'}
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">REPRESENTATIVE EXAMPLE</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {isFuncGroups ? activeGroup.example : moleculeName}
                </span>
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
