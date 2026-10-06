import React, { useRef, useEffect, useState } from 'react';
import { Gauge, Flame, Snowflake, RotateCcw, Activity } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationMetadata } from '../../types/simulation';

interface GasLawsSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

interface GasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const GasLawsSim: React.FC<GasLawsSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
  metadata,
}) => {
  const isBoyles = metadata.id === 'chem-boyles-law';
  const isCharles = metadata.id === 'chem-charles-law';
  const isGayLussac = metadata.id === 'chem-gay-lussac';
  const isCombined = metadata.id === 'chem-combined-gas-law';
  // Default is chem-ideal-gas or chem-gas-laws

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<GasParticle[]>([]);

  // Base state variables
  let volume = values.volume ?? 10.0; // Liters
  let temperature = values.temperature ?? 300; // Kelvin
  let moles = values.moles ?? 1.0; // moles

  if (isBoyles) {
    temperature = values.temperature ?? 300;
    volume = values.volume ?? 10.0;
  } else if (isCharles) {
    temperature = values.temperature ?? 300;
    const targetPressure = values.pressure ?? 1.0;
    // V = nRT / P
    volume = (1.0 * 0.08206 * temperature) / targetPressure;
  } else if (isGayLussac) {
    volume = 10.0; // constant rigid volume
    temperature = values.temperature ?? 300;
    moles = values.moles ?? 1.0;
  } else if (isCombined) {
    const p1 = values.p1 ?? 1.0;
    const v1 = values.v1 ?? 20.0;
    const t1 = values.t1 ?? 295;
    const p2 = values.p2 ?? 0.5;
    const t2 = values.t2 ?? 250;
    // V2 = (P1 * V1 * T2) / (P2 * T1)
    volume = (p1 * v1 * t2) / (p2 * t1);
    temperature = t2;
  }

  // Ideal Gas Law: P = (n * R * T) / V
  const R = 0.08206; // L·atm / (mol·K)
  const pressure = (moles * R * temperature) / Math.max(0.5, volume);

  // Root mean square velocity: v_rms = sqrt(3 * R * T / M)
  const molecularWeightKg = 0.028; // N2 = 28 g/mol
  const vRms = Math.sqrt((3 * 8.314 * temperature) / molecularWeightKg);

  // Initialize and animate canvas particles
  useEffect(() => {
    const count = Math.min(60, Math.max(15, Math.round(moles * 25)));
    const particles: GasParticle[] = [];
    const speedScale = Math.sqrt(temperature / 300) * 2.5;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: Math.random() * 200 + 20,
        y: Math.random() * 200 + 20,
        vx: Math.cos(angle) * speedScale,
        vy: Math.sin(angle) * speedScale,
      });
    }
    particlesRef.current = particles;
  }, [moles, temperature]);

  useEffect(() => {
    let animationFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Piston height depends on volume (scale 2L to 30L)
      const pistonWidth = canvas.width - 40;
      const pistonHeight = Math.min(canvas.height - 20, Math.max(80, (volume / 25) * (canvas.height - 40)));
      const pistonTop = canvas.height - pistonHeight - 20;

      // Draw cylinder walls
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(20, canvas.height - 20);
      ctx.lineTo(canvas.width - 20, canvas.height - 20);
      ctx.lineTo(canvas.width - 20, 20);
      ctx.stroke();

      // Draw Piston Head
      ctx.fillStyle = '#64748b';
      ctx.fillRect(20, pistonTop, pistonWidth, 12);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(20, pistonTop, pistonWidth, 12);

      // Piston rod
      ctx.fillStyle = '#475569';
      ctx.fillRect(canvas.width / 2 - 6, Math.max(5, pistonTop - 40), 12, 40);

      // Update and draw particles inside chamber (from pistonTop to canvas.height - 20)
      const particles = particlesRef.current;
      const speedMult = Math.sqrt(temperature / 300);

      ctx.fillStyle = '#38bdf8';
      particles.forEach((p) => {
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        // Wall collisions
        if (p.x <= 25) {
          p.x = 25;
          p.vx = Math.abs(p.vx);
        }
        if (p.x >= canvas.width - 25) {
          p.x = canvas.width - 25;
          p.vx = -Math.abs(p.vx);
        }
        if (p.y <= pistonTop + 16) {
          p.y = pistonTop + 16;
          p.vy = Math.abs(p.vy);
        }
        if (p.y >= canvas.height - 25) {
          p.y = canvas.height - 25;
          p.vy = -Math.abs(p.vy);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [volume, temperature]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Metric Ribbon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Thermodynamic State
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>P =</span>
                <span className="text-sky-400">{pressure.toFixed(2)} atm</span>
                <span className="text-xs font-normal text-slate-400">
                  ({(pressure * 101.325).toFixed(1)} kPa)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              V = {volume.toFixed(1)} L
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              T = {temperature.toFixed(0)} K ({(temperature - 273.15).toFixed(1)}°C)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
              v_rms = {vRms.toFixed(0)} m/s
            </span>
          </div>
        </div>

        {/* Visual Gas Piston Stage */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col md:flex-row items-center justify-around gap-8 min-h-[420px]">
          {/* Animated Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={300}
              height={320}
              className="rounded-xl bg-slate-900/30 shadow-inner"
            />
            <div className="text-center text-[10px] font-mono text-slate-500 mt-2">
              Piston Gas Chamber with Elastic Collisions
            </div>
          </div>

          {/* Instrument Readout Panel */}
          <div className="w-full md:w-64 space-y-4 font-mono text-xs">
            {/* Pressure Gauge Dial */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                Bourdon Pressure Gauge
              </span>
              <div className="relative w-32 h-20 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 60">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={pressure > 5 ? '#ef4444' : pressure > 3 ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="125"
                    strokeDashoffset={Math.max(0, 125 - (pressure / 8) * 125)}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute bottom-0 text-center font-bold text-slate-100 text-sm">
                  {pressure.toFixed(2)} atm
                </div>
              </div>
            </div>

            {/* Gas Law Formula Tag */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <span className="text-slate-400 text-[10px] uppercase block">Governing Law</span>
              <span className="text-cyan-300 font-bold text-sm block">
                {isBoyles ? 'P₁ · V₁ = P₂ · V₂' :
                 isCharles ? 'V₁ / T₁ = V₂ / T₂' :
                 isGayLussac ? 'P₁ / T₁ = P₂ / T₂' :
                 isCombined ? '(P₁·V₁)/T₁ = (P₂·V₂)/T₂' :
                 'P · V = n · R · T'}
              </span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {isBoyles ? 'Temperature is held constant. Compressing volume forces particles into a smaller space, doubling wall collision frequency.' :
                 isCharles ? 'Pressure is held constant. Heating expands kinetic energy, causing the gas to push the piston outward proportionally.' :
                 isGayLussac ? 'Volume is fixed in a rigid tank. Heating particles increases collision velocity and impact force against walls.' :
                 'Unifies all gas relationships with R = 0.08206 L·atm/(mol·K).'}
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
