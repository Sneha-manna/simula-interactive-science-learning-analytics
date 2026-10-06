import React, { useRef, useEffect, useState } from 'react';
import { Flame, Sparkles, RotateCcw, Activity } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface ReactionRateSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'A' | 'B' | 'Product';
}

export const ReactionRateSim: React.FC<ReactionRateSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'chem-reaction-rate')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const temperature = values.temperature ?? 300; // K
  const activationEnergy = values.activationEnergy ?? 45; // kJ/mol
  const hasCatalyst = (values.hasCatalyst ?? 0) === 1;

  // Effective activation energy (catalyst reduces Ea by 20 kJ/mol)
  const effectiveEa = hasCatalyst ? Math.max(10, activationEnergy - 20) : activationEnergy;

  // Arrhenius rate constant k = A * exp(-Ea / (R * T))
  // R = 8.314 J/(mol*K) = 0.008314 kJ/(mol*K)
  const R = 0.008314;
  const kRate = Math.exp(-effectiveEa / (R * temperature));

  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [productCount, setProductCount] = useState(0);

  // Initialize reacting particles
  const resetReaction = () => {
    const pts: Molecule[] = [];
    const countA = 20;
    const countB = 20;

    for (let i = 0; i < countA; i++) {
      pts.push({
        x: 30 + Math.random() * 260,
        y: 30 + Math.random() * 260,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'A',
      });
    }
    for (let i = 0; i < countB; i++) {
      pts.push({
        x: 30 + Math.random() * 260,
        y: 30 + Math.random() * 260,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'B',
      });
    }

    setMolecules(pts);
    setProductCount(0);
    incrementRunCount();
  };

  useEffect(() => {
    resetReaction();
  }, [temperature, activationEnergy, hasCatalyst]);

  // Simulation physics loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const vesselW = 320;
    const vesselH = 320;
    const vesselX = 40;
    const vesselY = 60;

    const speedScale = Math.sqrt(temperature / 300) * 1.6;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw 2D Reaction Vessel
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.strokeRect(vesselX, vesselY, vesselW, vesselH);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(vesselX, vesselY, vesselW, vesselH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('Sealed Vessel (A + B → AB)', vesselX + 10, vesselY - 8);

      // Update positions & check collisions
      const molList = molecules;
      const radius = 6;

      for (let i = 0; i < molList.length; i++) {
        const m1 = molList[i];
        m1.x += m1.vx * speedScale;
        m1.y += m1.vy * speedScale;

        // Wall collisions
        if (m1.x <= radius) {
          m1.x = radius;
          m1.vx = Math.abs(m1.vx);
        } else if (m1.x >= vesselW - radius) {
          m1.x = vesselW - radius;
          m1.vx = -Math.abs(m1.vx);
        }

        if (m1.y <= radius) {
          m1.y = radius;
          m1.vy = Math.abs(m1.vy);
        } else if (m1.y >= vesselH - radius) {
          m1.y = vesselH - radius;
          m1.vy = -Math.abs(m1.vy);
        }

        // Inter-molecular collisions
        for (let j = i + 1; j < molList.length; j++) {
          const m2 = molList[j];
          const dx = m2.x - m1.x;
          const dy = m2.y - m1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius * 2) {
            // Collision occurred!
            // Check if reaction occurs between A and B
            if (
              (m1.type === 'A' && m2.type === 'B') ||
              (m1.type === 'B' && m2.type === 'A')
            ) {
              // Probability of overcoming Ea
              if (Math.random() < Math.min(0.85, kRate * 250)) {
                m1.type = 'Product';
                m2.type = 'Product';
                setProductCount((c) => c + 1);
              }
            }

            // Elastic bounce impulse
            const tempVx = m1.vx;
            const tempVy = m1.vy;
            m1.vx = m2.vx;
            m1.vy = m2.vy;
            m2.vx = tempVx;
            m2.vy = tempVy;
          }
        }

        // Render molecule
        const rx = vesselX + m1.x;
        const ry = vesselY + m1.y;

        ctx.beginPath();
        ctx.arc(rx, ry, radius, 0, Math.PI * 2);
        if (m1.type === 'A') ctx.fillStyle = '#38bdf8'; // Blue
        else if (m1.type === 'B') ctx.fillStyle = '#f59e0b'; // Amber
        else ctx.fillStyle = '#10b981'; // Emerald product
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. Draw Energy Profile Barrier Diagram on Right
      const diagramX = 400;
      const diagramY = 60;
      const diagramW = 300;
      const diagramH = 320;

      // Axis
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(diagramX, diagramY + diagramH - 40);
      ctx.lineTo(diagramX + diagramW, diagramY + diagramH - 40); // Reaction coordinate
      ctx.moveTo(diagramX, diagramY + diagramH - 40);
      ctx.lineTo(diagramX, diagramY); // Potential energy
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('Potential Energy', diagramX + 5, diagramY + 14);
      ctx.fillText('Reaction Coordinate', diagramX + diagramW - 130, diagramY + diagramH - 48);

      // Reactants level
      const rY = diagramY + diagramH - 100;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(diagramX + 20, rY);
      ctx.lineTo(diagramX + 80, rY);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Reactants (A + B)', diagramX + 20, rY - 8);

      // Peak Activation Barrier Hump (uncatalyzed)
      const peakY = rY - (activationEnergy / 80) * 160;
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(diagramX + 80, rY);
      ctx.bezierCurveTo(diagramX + 110, rY, diagramX + 120, peakY, diagramX + 160, peakY);
      ctx.bezierCurveTo(diagramX + 200, peakY, diagramX + 210, rY + 40, diagramX + 260, rY + 40);
      ctx.stroke();

      // If catalyst present, draw lower dotted pathway
      if (hasCatalyst) {
        const catPeakY = rY - (effectiveEa / 80) * 160;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(diagramX + 80, rY);
        ctx.bezierCurveTo(diagramX + 110, rY, diagramX + 120, catPeakY, diagramX + 160, catPeakY);
        ctx.bezierCurveTo(diagramX + 200, catPeakY, diagramX + 210, rY + 40, diagramX + 260, rY + 40);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#10b981';
        ctx.fillText(`Catalyzed Ea = ${effectiveEa} kJ`, diagramX + 110, catPeakY - 8);
      }

      ctx.fillStyle = '#f87171';
      ctx.fillText(`Uncatalyzed Ea = ${activationEnergy} kJ`, diagramX + 110, peakY - 8);

      // Products level
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(diagramX + 240, rY + 40);
      ctx.lineTo(diagramX + 290, rY + 40);
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.fillText('Products (AB)', diagramX + 220, rY + 56);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [temperature, activationEnergy, hasCatalyst, effectiveEa, kRate, molecules]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Rate Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Arrhenius Equation: k = A·exp(-Ea / RT)
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>Rate Constant:</span>
                <span className="text-cyan-300">{(kRate * 1e6).toFixed(2)} × 10⁻⁶ s⁻¹</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetReaction}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Reactants</span>
            </button>
            <span className="px-2.5 py-1 text-xs font-mono rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              Products Formed: {productCount}
            </span>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={720}
            height={440}
            className="w-full h-auto block"
          />
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm">
            Ea Barrier Diagram + Particle Vessel
          </div>
        </div>
      </div>

      {/* Right Col: Controls */}
      <div className="space-y-4">
        <SimulationControls
          controls={metadata.controls}
          values={values}
          onChange={(id, val) => {
            setValue(id, val);
            incrementRunCount();
          }}
          onReset={resetValues}
          extraControls={
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Chemical Catalyst
              </span>
              <button
                onClick={() => {
                  setValue('hasCatalyst', hasCatalyst ? 0 : 1);
                  incrementRunCount();
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  hasCatalyst
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{hasCatalyst ? 'Catalyst Active (-20 kJ/mol)' : 'Add Catalyst'}</span>
                </div>
                <span className="text-[10px] font-mono">{hasCatalyst ? 'ENABLED' : 'DISABLED'}</span>
              </button>
            </div>
          }
        />

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Activation Energy Explained
          </div>
          <p className="text-slate-300 leading-relaxed">
            Molecules must collide with sufficient kinetic energy to overcome the transition state barrier <span className="text-red-300 font-mono">Ea</span>. Adding a catalyst provides an alternate reaction mechanism with a significantly lower barrier, drastically multiplying the reaction velocity without being consumed.
          </p>
        </div>
      </div>
    </div>
  );
};
