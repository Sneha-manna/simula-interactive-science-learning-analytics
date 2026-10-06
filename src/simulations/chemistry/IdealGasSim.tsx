import React, { useRef, useEffect, useState } from 'react';
import { Gauge, Flame, Snowflake, RotateCcw } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface IdealGasSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const IdealGasSim: React.FC<IdealGasSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'chem-ideal-gas')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const temperature = values.temperature ?? 300; // Kelvin
  const volume = values.volume ?? 5.0; // Liters
  const moles = values.moles ?? 1.0; // mol

  // Ideal Gas Law: P = (n * R * T) / V
  // R = 0.0821 L·atm / (mol·K)
  const R = 0.08206;
  const pressure = (moles * R * temperature) / Math.max(1, volume); // in atm

  // RMS Velocity v_rms = sqrt(3 R T / M)
  const vRms = Math.sqrt((3 * 8.314 * temperature) / 0.028); // for N2 gas

  // Particle state for collision canvas
  const particlesRef = useRef<Particle[]>([]);

  // Initialize or adjust particle count
  const particleCount = Math.round(moles * 40);

  useEffect(() => {
    // Re-seed particles inside current chamber bounds
    const chamberW = 320;
    const chamberH = Math.min(280, volume * 35);

    const pts: Particle[] = [];
    const speedFactor = Math.sqrt(temperature / 300) * 1.5;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.8 + Math.random() * 0.8) * speedFactor;
      pts.push({
        x: 20 + Math.random() * (chamberW - 40),
        y: 20 + Math.random() * (chamberH - 40),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
    particlesRef.current = pts;
  }, [particleCount, volume]);

  // Animation frame loop for bouncing particles
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const chamberX = (width - 340) / 2;
    const chamberBottom = height - 50;
    const chamberW = 340;
    const chamberH = Math.min(260, Math.max(80, volume * 32));
    const chamberTop = chamberBottom - chamberH;

    const speedScale = Math.sqrt(temperature / 300);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark chamber background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Chamber Walls (Cylinder)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Left Wall
      ctx.moveTo(chamberX, chamberBottom - 270);
      ctx.lineTo(chamberX, chamberBottom);
      // Floor
      ctx.lineTo(chamberX + chamberW, chamberBottom);
      // Right Wall
      ctx.lineTo(chamberX + chamberW, chamberBottom - 270);
      ctx.stroke();

      // Gas volume interior fill
      ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.fillRect(chamberX + 2, chamberTop, chamberW - 4, chamberH);

      // Movable Piston Head (at chamberTop)
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillRect(chamberX + 2, chamberTop - 18, chamberW - 4, 18);
      ctx.strokeRect(chamberX + 2, chamberTop - 18, chamberW - 4, 18);

      // Piston Rod
      ctx.fillStyle = '#64748b';
      ctx.fillRect(chamberX + chamberW / 2 - 8, chamberTop - 65, 16, 48);

      // Analog Pressure Dial on Piston
      const dialX = chamberX + chamberW / 2;
      const dialY = chamberTop - 85;
      const dialRadius = 24;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dial needle
      const maxP = 15; // atm
      const needleAngle = -Math.PI * 0.75 + (Math.min(pressure, maxP) / maxP) * (Math.PI * 1.5);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dialX, dialY);
      ctx.lineTo(dialX + Math.cos(needleAngle) * 18, dialY + Math.sin(needleAngle) * 18);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${pressure.toFixed(1)} atm`, dialX, dialY + dialRadius + 12);

      // Burner / Cooler visual under chamber floor
      if (temperature > 320) {
        // Flame icons / warm glow
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(dialX, chamberBottom + 20, 45, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#f87171';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('🔥 Thermal Energy Influx', dialX, chamberBottom + 35);
      } else if (temperature < 260) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.arc(dialX, chamberBottom + 20, 45, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('❄️ Cryogenic Heat Extraction', dialX, chamberBottom + 35);
      }

      // Update & render gas particles
      const pts = particlesRef.current;
      const radius = 3.5;

      pts.forEach((p) => {
        p.x += p.vx * speedScale;
        p.y += p.vy * speedScale;

        // Bounce off left/right walls
        if (p.x <= radius) {
          p.x = radius;
          p.vx = Math.abs(p.vx);
        } else if (p.x >= chamberW - radius) {
          p.x = chamberW - radius;
          p.vx = -Math.abs(p.vx);
        }

        // Bounce off floor and piston head
        if (p.y >= chamberH - radius) {
          p.y = chamberH - radius;
          p.vy = -Math.abs(p.vy);
        } else if (p.y <= radius) {
          p.y = radius;
          p.vy = Math.abs(p.vy);
        }

        // Draw particle
        const renderPx = chamberX + p.x;
        const renderPy = chamberTop + p.y;

        ctx.fillStyle = temperature > 350 ? '#f87171' : temperature < 260 ? '#7dd3fc' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(renderPx, renderPy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [temperature, volume, moles, pressure]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Equation State */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                PV = nRT State Equation
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>P =</span>
                <span className="text-cyan-300">{pressure.toFixed(2)} atm</span>
                <span className="text-xs font-normal text-slate-400">({(pressure * 101.325).toFixed(1)} kPa)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              v_rms = {vRms.toFixed(0)} m/s
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Gas: N₂ (28 g/mol)
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
            Cylinder Piston Apparatus
          </div>
        </div>

        {/* Gas Law Quick Scenarios */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Historical Gas Laws Modes
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs font-medium">
            <button
              onClick={() => {
                setValue('volume', 2.5);
                setValue('temperature', 300);
                incrementRunCount();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
            >
              <div className="font-bold text-cyan-400">Boyle's Law</div>
              <div className="text-[10px] text-slate-400">Compress Volume (P ↑)</div>
            </button>
            <button
              onClick={() => {
                setValue('temperature', 500);
                setValue('volume', 8.0);
                incrementRunCount();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
            >
              <div className="font-bold text-amber-400">Charles's Law</div>
              <div className="text-[10px] text-slate-400">Thermal Expansion (T ↑, V ↑)</div>
            </button>
            <button
              onClick={() => {
                setValue('temperature', 450);
                setValue('volume', 5.0);
                incrementRunCount();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
            >
              <div className="font-bold text-rose-400">Gay-Lussac's Law</div>
              <div className="text-[10px] text-slate-400">Isochoric Heating (P ↑)</div>
            </button>
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
        />

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
            Kinetic Molecular Theory
          </div>
          <p className="text-slate-300 leading-relaxed">
            Gas pressure is the cumulative macroscopic force of billions of particle collisions against the cylinder walls per unit time. As you decrease chamber <span className="text-cyan-300 font-mono">Volume</span> or heat up the particles (<span className="text-amber-300 font-mono">Temperature</span>), the collision frequency increases proportionally.
          </p>
        </div>
      </div>
    </div>
  );
};
