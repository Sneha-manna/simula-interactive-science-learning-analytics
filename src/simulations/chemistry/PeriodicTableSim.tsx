import React, { useState } from 'react';
import { Search, Info, Layers, Zap, Compass, Shield } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';
import { SimulationMetadata } from '../../types/simulation';

interface PeriodicTableSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata?: SimulationMetadata;
}

interface ElementData {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  group: number;
  period: number;
  category: 'alkali' | 'alkaline' | 'transition' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble' | 'lanthanide' | 'actinide';
  electronegativity: number;
  atomicRadius: number; // pm
  ionizationEnergy: number; // kJ/mol
  valence: number;
  config: string;
  summary: string;
}

// Key representative elements across groups and periods
const ELEMENTS: ElementData[] = [
  { z: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, group: 1, period: 1, category: 'nonmetal', electronegativity: 2.20, atomicRadius: 53, ionizationEnergy: 1312, valence: 1, config: '1s¹', summary: 'Most abundant element in the universe, fuel of stars.' },
  { z: 2, symbol: 'He', name: 'Helium', mass: 4.0026, group: 18, period: 1, category: 'noble', electronegativity: 0, atomicRadius: 31, ionizationEnergy: 2372, valence: 2, config: '1s²', summary: 'Colorless, odorless noble gas produced in nuclear fusion.' },
  { z: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, group: 1, period: 2, category: 'alkali', electronegativity: 0.98, atomicRadius: 167, ionizationEnergy: 520, valence: 1, config: '[He] 2s¹', summary: 'Lightest metal, cornerstone of modern rechargeable batteries.' },
  { z: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, group: 2, period: 2, category: 'alkaline', electronegativity: 1.57, atomicRadius: 112, ionizationEnergy: 899, valence: 2, config: '[He] 2s²', summary: 'High-strength, lightweight metal used in aerospace optics.' },
  { z: 5, symbol: 'B', name: 'Boron', mass: 10.81, group: 13, period: 2, category: 'metalloid', electronegativity: 2.04, atomicRadius: 87, ionizationEnergy: 801, valence: 3, config: '[He] 2s² 2p¹', summary: 'Hard metalloid essential for heat-resistant borosilicate glass.' },
  { z: 6, symbol: 'C', name: 'Carbon', mass: 12.011, group: 14, period: 2, category: 'nonmetal', electronegativity: 2.55, atomicRadius: 67, ionizationEnergy: 1086, valence: 4, config: '[He] 2s² 2p²', summary: 'Chemical foundation of all known terrestrial life and organic chemistry.' },
  { z: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, group: 15, period: 2, category: 'nonmetal', electronegativity: 3.04, atomicRadius: 56, ionizationEnergy: 1402, valence: 5, config: '[He] 2s² 2p³', summary: 'Makes up 78% of Earth atmosphere, vital for proteins and DNA.' },
  { z: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, group: 16, period: 2, category: 'nonmetal', electronegativity: 3.44, atomicRadius: 48, ionizationEnergy: 1314, valence: 6, config: '[He] 2s² 2p⁴', summary: 'Essential for cellular respiration and universal combustion.' },
  { z: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, group: 17, period: 2, category: 'halogen', electronegativity: 3.98, atomicRadius: 42, ionizationEnergy: 1681, valence: 7, config: '[He] 2s² 2p⁵', summary: 'Most electronegative element, aggressively reactive halogen.' },
  { z: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, group: 18, period: 2, category: 'noble', electronegativity: 0, atomicRadius: 38, ionizationEnergy: 2080, valence: 8, config: '[He] 2s² 2p⁶', summary: 'Inert noble gas that emits brilliant orange-red light in discharge tubes.' },
  { z: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, group: 1, period: 3, category: 'alkali', electronegativity: 0.93, atomicRadius: 190, ionizationEnergy: 496, valence: 1, config: '[Ne] 3s¹', summary: 'Highly reactive alkali metal, reacts vigorously with water.' },
  { z: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, group: 2, period: 3, category: 'alkaline', electronegativity: 1.31, atomicRadius: 145, ionizationEnergy: 738, valence: 2, config: '[Ne] 3s²', summary: 'Burns with dazzling white flame, core of chlorophyll.' },
  { z: 13, symbol: 'Al', name: 'Aluminum', mass: 26.982, group: 13, period: 3, category: 'post-transition', electronegativity: 1.61, atomicRadius: 118, ionizationEnergy: 578, valence: 3, config: '[Ne] 3s² 3p¹', summary: 'Abundant crustal metal prized for corrosion resistance and lightness.' },
  { z: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, group: 14, period: 3, category: 'metalloid', electronegativity: 1.90, atomicRadius: 111, ionizationEnergy: 786, valence: 4, config: '[Ne] 3s² 3p²', summary: 'Semiconductor pillar of modern global computing and electronics.' },
  { z: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, group: 15, period: 3, category: 'nonmetal', electronegativity: 2.19, atomicRadius: 98, ionizationEnergy: 1012, valence: 5, config: '[Ne] 3s² 3p³', summary: 'Critical element in ATP energy currency and nucleic acids.' },
  { z: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, group: 16, period: 3, category: 'nonmetal', electronegativity: 2.58, atomicRadius: 88, ionizationEnergy: 1000, valence: 6, config: '[Ne] 3s² 3p⁴', summary: 'Yellow nonmetal used in sulfuric acid synthesis and vulcanized rubber.' },
  { z: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, group: 17, period: 3, category: 'halogen', electronegativity: 3.16, atomicRadius: 79, ionizationEnergy: 1251, valence: 7, config: '[Ne] 3s² 3p⁵', summary: 'Pungent greenish-yellow halogen used universally in water sanitation.' },
  { z: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, group: 18, period: 3, category: 'noble', electronegativity: 0, atomicRadius: 71, ionizationEnergy: 1521, valence: 8, config: '[Ne] 3s² 3p⁶', summary: 'Abundant noble gas providing inert atmosphere for welding.' },
  { z: 19, symbol: 'K', name: 'Potassium', mass: 39.098, group: 1, period: 4, category: 'alkali', electronegativity: 0.82, atomicRadius: 243, ionizationEnergy: 419, valence: 1, config: '[Ar] 4s¹', summary: 'Crucial for cellular neuron action potentials and fertilizers.' },
  { z: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, group: 2, period: 4, category: 'alkaline', electronegativity: 1.00, atomicRadius: 194, ionizationEnergy: 590, valence: 2, config: '[Ar] 4s²', summary: 'Essential structural component of teeth, bone, and limestone.' },
  { z: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, group: 8, period: 4, category: 'transition', electronegativity: 1.83, atomicRadius: 156, ionizationEnergy: 762, valence: 2, config: '[Ar] 3d⁶ 4s²', summary: 'Backbone of industrial civilization and central heme in oxygen transport.' },
  { z: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, group: 11, period: 4, category: 'transition', electronegativity: 1.90, atomicRadius: 145, ionizationEnergy: 745, valence: 1, config: '[Ar] 3d¹⁰ 4s¹', summary: 'Exceptional thermal and electrical conductor utilized in wiring.' },
  { z: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, group: 12, period: 4, category: 'transition', electronegativity: 1.65, atomicRadius: 142, ionizationEnergy: 906, valence: 2, config: '[Ar] 3d¹⁰ 4s²', summary: 'Used in galvanizing steel against corrosion and essential enzyme cofactor.' },
  { z: 35, symbol: 'Br', name: 'Bromine', mass: 79.904, group: 17, period: 4, category: 'halogen', electronegativity: 2.96, atomicRadius: 94, ionizationEnergy: 1140, valence: 7, config: '[Ar] 3d¹⁰ 4s² 4p⁵', summary: 'Only liquid nonmetal at standard room temperature and pressure.' },
  { z: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, group: 11, period: 5, category: 'transition', electronegativity: 1.93, atomicRadius: 165, ionizationEnergy: 731, valence: 1, config: '[Kr] 4d¹⁰ 5s¹', summary: 'Highest electrical conductivity of any metal, precious jewelry.' },
  { z: 79, symbol: 'Au', name: 'Gold', mass: 196.97, group: 11, period: 6, category: 'transition', electronegativity: 2.54, atomicRadius: 174, ionizationEnergy: 890, valence: 1, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', summary: 'Noble metal that does not tarnish, premier historical store of value.' },
];

export const PeriodicTableSim: React.FC<PeriodicTableSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata: propMetadata,
}) => {
  const metadata = propMetadata || SIMULATION_REGISTRY.find((s) => s.id === 'chem-periodic-table') || {
    id: 'chem-periodic-table',
    title: 'Interactive Periodic Table',
    controls: [],
  };

  const [selectedElement, setSelectedElement] = useState<ElementData>(ELEMENTS[5]); // Carbon default
  const [searchQuery, setSearchQuery] = useState('');
  const [colorMode, setColorMode] = useState<'category' | 'electronegativity' | 'radius' | 'ionization'>('category');

  // Filter elements
  const filteredElements = ELEMENTS.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.z.toString() === searchQuery.trim()
  );

  const getCategoryColor = (cat: ElementData['category']) => {
    switch (cat) {
      case 'alkali': return 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30';
      case 'alkaline': return 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';
      case 'transition': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30';
      case 'post-transition': return 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30';
      case 'metalloid': return 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30';
      case 'nonmetal': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
      case 'halogen': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30';
      case 'noble': return 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getHeatmapColor = (elem: ElementData) => {
    if (colorMode === 'electronegativity') {
      const val = elem.electronegativity;
      if (val === 0) return 'bg-slate-800 text-slate-400 border-slate-700';
      if (val < 1.5) return 'bg-blue-950 text-blue-300 border-blue-700';
      if (val < 2.5) return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      if (val < 3.2) return 'bg-amber-950 text-amber-300 border-amber-700';
      return 'bg-red-950 text-red-300 border-red-700';
    }
    if (colorMode === 'radius') {
      const r = elem.atomicRadius;
      if (r < 60) return 'bg-purple-950 text-purple-300 border-purple-700';
      if (r < 120) return 'bg-cyan-950 text-cyan-300 border-cyan-700';
      if (r < 180) return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      return 'bg-amber-950 text-amber-300 border-amber-700';
    }
    if (colorMode === 'ionization') {
      const ie = elem.ionizationEnergy;
      if (ie < 600) return 'bg-blue-950 text-blue-300 border-blue-700';
      if (ie < 1000) return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      if (ie < 1500) return 'bg-amber-950 text-amber-300 border-amber-700';
      return 'bg-red-950 text-red-300 border-red-700';
    }
    return getCategoryColor(elem.category);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Interactive Periodic Grid & Heatmap Controls */}
      <div className="lg:col-span-2 space-y-4">
        {/* Heatmap & Filter Toolbar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
              Overlay:
            </span>
            <div className="flex gap-1.5 overflow-x-auto">
              {(['category', 'electronegativity', 'radius', 'ionization'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setColorMode(mode)}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-colors capitalize ${
                    colorMode === mode
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {mode === 'ionization' ? 'Ionization Energy' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by symbol, name, Z..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52"
            />
          </div>
        </div>

        {/* Periodic Grid Container */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl min-h-[400px]">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5">
            {filteredElements.map((elem) => {
              const isSelected = selectedElement.z === elem.z;
              return (
                <button
                  key={elem.z}
                  onClick={() => {
                    setSelectedElement(elem);
                    incrementRunCount();
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all aspect-square ${getHeatmapColor(
                    elem
                  )} ${isSelected ? 'ring-2 ring-cyan-400 scale-105 z-10 shadow-lg shadow-cyan-500/20' : ''}`}
                >
                  <div className="flex justify-between items-start text-[10px] font-mono leading-none">
                    <span className="opacity-70">{elem.z}</span>
                    <span className="opacity-70 font-semibold">{elem.mass.toFixed(1)}</span>
                  </div>

                  <div className="text-center py-1">
                    <div className="text-xl font-black font-mono tracking-tight leading-none">
                      {elem.symbol}
                    </div>
                    <div className="text-[10px] font-medium truncate mt-1">
                      {elem.name}
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-center opacity-80 truncate">
                    {colorMode === 'electronegativity' && `χ = ${elem.electronegativity}`}
                    {colorMode === 'radius' && `${elem.atomicRadius} pm`}
                    {colorMode === 'ionization' && `${elem.ionizationEnergy} kJ`}
                    {colorMode === 'category' && elem.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Periodic Trends Infographic Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Core Periodic Trends Matrix
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-bold text-cyan-400">Across a Period (Left → Right):</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Effective nuclear charge (<span className="text-slate-200">Z_eff</span>) increases, pulling outer electron shells inward. <strong>Atomic radius decreases</strong> while <strong>electronegativity and ionization energy increase</strong>.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-bold text-amber-400">Down a Group (Top → Bottom):</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Additional principal quantum shells (<span className="text-slate-200">n</span>) are added. <strong>Atomic radius increases</strong> due to inner shell electron shielding, making valence electrons easier to remove (lower IE).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Col: Selected Element Comprehensive Inspector */}
      <div className="space-y-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Header Tile */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 flex flex-col items-center justify-center text-cyan-400 font-mono shadow-inner">
              <span className="text-xs">{selectedElement.z}</span>
              <span className="text-2xl font-black">{selectedElement.symbol}</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-100">
                {selectedElement.name}
              </div>
              <div className="text-xs font-mono text-slate-400">
                Standard Atomic Weight: {selectedElement.mass} u
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">Electron Config:</span>
              <span className="text-cyan-300 font-bold">{selectedElement.config}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">Electronegativity:</span>
              <span className="text-amber-300 font-bold">
                {selectedElement.electronegativity > 0 ? `${selectedElement.electronegativity} (Pauling)` : 'Noble Gas (0)'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">Atomic Radius:</span>
              <span className="text-indigo-300 font-bold">{selectedElement.atomicRadius} pm</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">1st Ionization Energy:</span>
              <span className="text-emerald-300 font-bold">{selectedElement.ionizationEnergy} kJ/mol</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">Valence Electrons:</span>
              <span className="text-purple-300 font-bold">{selectedElement.valence}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
              <span className="text-slate-400">Period &amp; Group:</span>
              <span className="text-slate-200">Period {selectedElement.period}, Group {selectedElement.group}</span>
            </div>
          </div>

          {/* Summary / Physical Meaning */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs space-y-1">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
              Element Profile &amp; Role
            </span>
            <p className="text-slate-300 leading-relaxed">
              {selectedElement.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
