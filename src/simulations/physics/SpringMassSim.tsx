import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface SpringMassSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const SpringMassSim: React.FC<SpringMassSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'physics-spring-mass')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const k = values.springConstant ?? 25;
  const m = values.mass ?? 1.5;
  const x0 = values.displacement ?? 0.8;
  const damping = values.damping ?? 0.05;

  const omega = Math.sqrt(k / m);
  const period = (2 * Math.PI) / omega;

  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastStamp) / 1000;
      lastStamp = now;

      if (isPlaying) {
        setTime((prev) => prev + dt);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Current position: x(t) = x0 * exp(-damping*t) * cos(omega*t)
  const currentX = x0 * Math.exp(-damping * time) * Math.cos(omega * time);
  const restoringForce = -k * currentX;

  // Energy
  const potentialEnergy = 0.5 * k * currentX * currentX;
  const totalTheoreticalEnergy = 0.5 * k * x0 * x0;
  const peRatio = totalTheoreticalEnergy > 0 ? Math.min(100, (potentialEnergy / totalTheoreticalEnergy) * 100) : 0;
  const keRatio = Math.max(0, 100 - peRatio);

  // Draw Helical Spring & Mass Block
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const ceilingY = 40;
    const equilibriumY = 220;
    const scale = 70; // pixels per meter of displacement

    // Ceiling mount
    ctx.fillStyle = '#334155';
    ctx.fillRect(centerX - 80, ceilingY - 10, 160, 10);

    // Ceiling hatch pattern
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    for (let hx = centerX - 70; hx <= centerX + 70; hx += 12) {
      ctx.beginPath();
      ctx.moveTo(hx, ceilingY - 10);
      ctx.lineTo(hx + 8, ceilingY);
      ctx.stroke();
    }

    // Mass position
    const blockY = equilibriumY + currentX * scale;
    const blockW = 60 + Math.min(30, m * 10);
    const blockH = 45;

    // Draw Helical Spring coils (zig-zag lines)
    const springStartY = ceilingY;
    const springEndY = blockY;
    const springLength = springEndY - springStartY;
    const coils = 14;
    const coilWidth = 24;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, springStartY);

    for (let i = 0; i <= coils; i++) {
      const cy = springStartY + (i / coils) * springLength;
      const cx = i === 0 || i === coils ? centerX : centerX + (i % 2 === 1 ? coilWidth : -coilWidth);
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Equilibrium indicator line (dashed)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX - 100, equilibriumY + blockH / 2);
    ctx.lineTo(centerX + 100, equilibriumY + blockH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Equilibrium (x = 0)', centerX - 110, equilibriumY + blockH / 2 + 3);

    // Mass Block
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.fillRect(centerX - blockW / 2, blockY, blockW, blockH);
    ctx.strokeRect(centerX - blockW / 2, blockY, blockW, blockH);

    // Block Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${m} kg`, centerX, blockY + blockH / 2 + 4);

    // Restoring Force Vector Arrow
    if (Math.abs(restoringForce) > 0.5) {
      const arrowLen = Math.max(-80, Math.min(80, restoringForce * 2.5));
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX + blockW / 2 + 15, blockY + blockH / 2);
      ctx.lineTo(centerX + blockW / 2 + 15, blockY + blockH / 2 - arrowLen);
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`F = ${restoringForce.toFixed(1)} N`, centerX + blockW / 2 + 22, blockY + blockH / 2 - arrowLen / 2);
    }
  }, [ceilingY => 40, currentX, m, restoringForce]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Formula Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Hooke's Law: F = -k·x
              </div>
              <div className="text-xl font-black font-mono text-cyan-300">
                F = -({k} N/m) · ({currentX.toFixed(2)}m) = {restoringForce.toFixed(2)} N
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
                incrementRunCount();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Release from Displacement"
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
            height={420}
            className="w-full h-auto block"
          />
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 backdrop-blur-sm">
            T = {period.toFixed(2)}s | ω = {omega.toFixed(2)} rad/s
          </div>
        </div>

        {/* Energy Balance */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-amber-400">Elastic PE (½kx²): {potentialEnergy.toFixed(2)} J</span>
              <span className="text-slate-400">{peRatio.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-100"
                style={{ width: `${peRatio}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-cyan-400">Kinetic Energy (½mv²): {(totalTheoreticalEnergy - potentialEnergy).toFixed(2)} J</span>
              <span className="text-slate-400">{keRatio.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-100"
                style={{ width: `${keRatio}%` }}
              />
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
            Restoring Direction
          </div>
          <p className="text-slate-300 leading-relaxed">
            The negative sign in <span className="text-amber-300 font-mono">F = -kx</span> guarantees that the restoring force always opposes displacement. When displaced downwards (<span className="text-cyan-300 font-mono">+x</span>), the spring pulls upwards with <span className="text-cyan-300 font-mono">-F</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
