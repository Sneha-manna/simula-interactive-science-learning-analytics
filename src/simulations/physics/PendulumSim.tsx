import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface PendulumSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const PendulumSim: React.FC<PendulumSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'physics-pendulum')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const length = values.length ?? 1.5;
  const gravity = values.gravity ?? 9.81;
  const initialAngleDeg = values.initialAngle ?? 25;
  const damping = values.damping ?? 0.02;

  // Small angle period T = 2π * sqrt(L / g)
  const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / gravity);
  const naturalFrequency = Math.sqrt(gravity / length);

  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  // Angle vs time history for graph
  const [history, setHistory] = useState<{ t: number; theta: number }[]>([]);

  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastStamp) / 1000;
      lastStamp = now;

      if (isPlaying) {
        setTime((prev) => {
          const next = prev + dt;
          // Current theta: θ(t) = θ₀ * exp(-damping * t) * cos(ω * t)
          const rad0 = (initialAngleDeg * Math.PI) / 180;
          const curTheta = rad0 * Math.exp(-damping * next) * Math.cos(naturalFrequency * next);

          setHistory((h) => {
            const updated = [...h, { t: next, theta: (curTheta * 180) / Math.PI }];
            if (updated.length > 80) updated.shift();
            return updated;
          });

          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, damping, naturalFrequency, initialAngleDeg]);

  // Current physics state
  const rad0 = (initialAngleDeg * Math.PI) / 180;
  const currentAngleRad = rad0 * Math.exp(-damping * time) * Math.cos(naturalFrequency * time);
  const currentAngleDeg = (currentAngleRad * 180) / Math.PI;

  // Kinetic & Potential energy estimation (normalized)
  const maxPotential = 1 - Math.cos(rad0);
  const currentPotential = Math.max(0, 1 - Math.cos(currentAngleRad));
  const pePercent = maxPotential > 0.001 ? (currentPotential / maxPotential) * 100 : 0;
  const kePercent = Math.max(0, 100 - pePercent);

  // Draw Pendulum Bob & Arc
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    const pivotX = width / 2;
    const pivotY = 50;
    const visualLength = Math.min(220, length * 110);

    // Pivot mount bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(pivotX - 40, pivotY - 8, 80, 8);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Dotted vertical equilibrium line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + visualLength + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bob coordinates
    const bobX = pivotX + visualLength * Math.sin(currentAngleRad);
    const bobY = pivotY + visualLength * Math.cos(currentAngleRad);

    // Trace swing arc (subtle)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const maxRad = (initialAngleDeg * Math.PI) / 180;
    ctx.arc(pivotX, pivotY, visualLength, Math.PI / 2 - maxRad, Math.PI / 2 + maxRad);
    ctx.stroke();

    // String / Rod
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Pendulum Bob
    const bobRadius = 16;
    const radialGlow = ctx.createRadialGradient(bobX, bobY, 2, bobX, bobY, bobRadius * 1.8);
    radialGlow.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    radialGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = radialGlow;
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Live Angle indicator
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = currentAngleDeg >= 0 ? 'left' : 'right';
    ctx.fillText(`θ = ${currentAngleDeg.toFixed(1)}°`, bobX + (currentAngleDeg >= 0 ? 22 : -22), bobY);
  }, [length, currentAngleRad, currentAngleDeg, initialAngleDeg]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Formula & Period Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Period Formula: T ≈ 2π √(L / g)
              </div>
              <div className="text-xl font-black font-mono text-cyan-300">
                T = {theoreticalPeriod.toFixed(2)} seconds (f = {(1 / theoreticalPeriod).toFixed(2)} Hz)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              onClick={() => {
                setTime(0);
                setHistory([]);
                incrementRunCount();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reset to Initial Angle"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={720}
            height={380}
            className="w-full h-auto block"
          />
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 backdrop-blur-sm">
            Simple Harmonic Oscillator
          </div>
        </div>

        {/* Energy Conservation Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Mechanical Energy Transformation (E_total = E_k + E_p)</span>
            <span className="font-mono text-cyan-300">Angle: {currentAngleDeg.toFixed(1)}°</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-amber-400">Potential Energy (E_p)</span>
                <span className="text-slate-400">{pePercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-100"
                  style={{ width: `${pePercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-cyan-400">Kinetic Energy (E_k)</span>
                <span className="text-slate-400">{kePercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-100"
                  style={{ width: `${kePercent}%` }}
                />
              </div>
            </div>
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
            Mass Independence Law
          </div>
          <p className="text-slate-300 leading-relaxed">
            Galileo observed in the Cathedral of Pisa that a pendulum’s period does NOT depend on bob mass. Only string length <span className="text-cyan-300 font-mono">L</span> and gravitational acceleration <span className="text-indigo-300 font-mono">g</span> dictate the swing rate!
          </p>
        </div>
      </div>
    </div>
  );
};
