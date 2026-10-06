import React, { useRef, useEffect, useState } from 'react';
import { Flame, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface ReactionKineticsSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'A' | 'B' | 'Product';
}

export const ReactionKineticsSim: React.FC<ReactionKineticsSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isCollision = metadata.id === 'chem-collision-theory';
  const isCatalyst = metadata.id === 'chem-catalysts';
  const isArrhenius = metadata.id === 'chem-activation-energy';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [productCount, setProductCount] = useState(0);
  const moleculesRef = useRef<Molecule[]>([]);

  // Simulation parameters
  const temperature = values.temperature ?? 320; // K
  const catalystActive = (values.catalyst ?? 0) === 1 || (values.hasCatalyst ?? 0) === 1;
  const rawEa = values.activationEnergy ?? 50; // kJ/mol
  const ea = catalystActive ? Math.max(15, rawEa - 25) : rawEa;
  const concA = values.concA ?? (values.concentration ?? 1.0);
  const concB = values.concB ?? 1.0;

  // Arrhenius rate constant: k = A * exp(-Ea / (R * T))
  const R_gas = 8.314; // J/(mol*K)
  const A_factor = 1e6;
  const rateConstant = A_factor * Math.exp((-ea * 1000) / (R_gas * temperature));
  // Relative rate scale for visualization
  const relativeRate = Math.min(100, Number((rateConstant / 100).toFixed(2)));

  // Initialize reacting particles
  useEffect(() => {
    const totalA = Math.round(concA * 15);
    const totalB = Math.round(concB * 15);
    const mols: Molecule[] = [];
    const speed = Math.sqrt(temperature / 300) * 2.2;

    for (let i = 0; i < totalA; i++) {
      mols.push({
        x: Math.random() * 260 + 20,
        y: Math.random() * 260 + 20,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        type: 'A',
      });
    }

    for (let i = 0; i < totalB; i++) {
      mols.push({
        x: Math.random() * 260 + 20,
        y: Math.random() * 260 + 20,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        type: 'B',
      });
    }

    moleculesRef.current = mols;
    setProductCount(0);
  }, [concA, concB, temperature]);

  // Particle collision simulation loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mols = moleculesRef.current;
      const speedMult = Math.sqrt(temperature / 300);

      // Reaction probability threshold based on Ea and T
      const rxnProb = Math.exp((-ea * 1000) / (R_gas * temperature));

      for (let i = 0; i < mols.length; i++) {
        const m1 = mols[i];
        m1.x += m1.vx * speedMult;
        m1.y += m1.vy * speedMult;

        // Wall bounds
        if (m1.x <= 10 || m1.x >= canvas.width - 10) m1.vx *= -1;
        if (m1.y <= 10 || m1.y >= canvas.height - 10) m1.vy *= -1;

        // Particle collisions
        for (let j = i + 1; j < mols.length; j++) {
          const m2 = mols[j];
          const dx = m2.x - m1.x;
          const dy = m2.y - m1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 14) {
            // Check reaction between A and B
            if (
              ((m1.type === 'A' && m2.type === 'B') || (m1.type === 'B' && m2.type === 'A')) &&
              Math.random() < Math.max(0.04, rxnProb * 50)
            ) {
              m1.type = 'Product';
              m2.type = 'Product';
              setProductCount((prev) => prev + 1);
            } else {
              // Elastic bounce
              m1.vx *= -1;
              m2.vx *= -1;
            }
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(m1.x, m1.y, 6, 0, Math.PI * 2);
        if (m1.type === 'A') {
          ctx.fillStyle = '#f43f5e'; // Red Reactant A
        } else if (m1.type === 'B') {
          ctx.fillStyle = '#38bdf8'; // Cyan Reactant B
        } else {
          ctx.fillStyle = '#a855f7'; // Purple Product AB
        }
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [temperature, ea]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Kinetic Rate &amp; Collision Theory
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>Reaction Velocity</span>
                <span className="text-rose-400 font-bold">k = {rateConstant.toExponential(2)} s⁻¹</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Ea = {ea} kJ/mol {catalystActive && '(Catalyzed)'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              T = {temperature} K
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/60 text-purple-300 font-bold">
              Products: {productCount} AB
            </span>
          </div>
        </div>

        {/* Visual Lab Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {/* Reaction Vessel Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="rounded-2xl border-2 border-slate-700 bg-slate-900/40 shadow-inner"
            />
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2 px-1">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Reactant A</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Reactant B</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Product AB</span>
            </div>
          </div>

          {/* Potential Energy Reaction Coordinate Diagram */}
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Reaction Coordinate Energy Profile
              </div>
              <div className="h-32 w-full bg-slate-950 border border-slate-800 rounded-lg p-2 relative flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80">
                  {/* Reactants line */}
                  <line x1="5" y1="55" x2="25" y2="55" stroke="#f43f5e" strokeWidth="2.5" />
                  <text x="5" y="50" fill="#f43f5e" fontSize="6" fontFamily="monospace">Reactants</text>

                  {/* Uncatalyzed barrier */}
                  <path
                    d="M 25,55 Q 50,10 75,65"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray={catalystActive ? "2,2" : undefined}
                  />

                  {/* Catalyzed barrier if active */}
                  {catalystActive && (
                    <path
                      d="M 25,55 Q 50,30 75,65"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Products line */}
                  <line x1="75" y1="65" x2="95" y2="65" stroke="#a855f7" strokeWidth="2.5" />
                  <text x="75" y="75" fill="#a855f7" fontSize="6" fontFamily="monospace">Products</text>
                </svg>
              </div>

              <div className="text-[10px] font-mono flex justify-between text-slate-400">
                <span>Ea: {ea} kJ</span>
                <span className="text-emerald-400">Exothermic (ΔH &lt; 0)</span>
              </div>
            </div>

            {/* Arrhenius Equation Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-1 font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase block">Arrhenius Law</span>
              <span className="text-cyan-300 font-bold block">k = A · e^(-Ea / RT)</span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Catalysts provide an alternate mechanism with a lower activation energy, dramatically accelerating reaction rate without being consumed.
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
