import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Compass, ArrowUpRight } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface ProjectileSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const ProjectileSim: React.FC<ProjectileSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'physics-projectile')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const velocity = values.velocity ?? 25;
  const angleDeg = values.angle ?? 45;
  const gravity = values.gravity ?? 9.81;

  const angleRad = (angleDeg * Math.PI) / 180;
  const vx0 = velocity * Math.cos(angleRad);
  const vy0 = velocity * Math.sin(angleRad);

  // Exact Kinematic Analytics
  const totalFlightTime = (2 * vy0) / gravity;
  const maxHeight = (vy0 * vy0) / (2 * gravity);
  const totalRange = (velocity * velocity * Math.sin(2 * angleRad)) / gravity;

  // Animation state
  const [isFlying, setIsFlying] = useState(false);
  const [simTime, setSimTime] = useState(0);

  // Launch projectile
  const handleLaunch = () => {
    setSimTime(0);
    setIsFlying(true);
    incrementRunCount();
  };

  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastStamp) / 1000;
      lastStamp = now;

      if (isFlying) {
        setSimTime((prev) => {
          const next = prev + dt * 1.5;
          if (next >= totalFlightTime) {
            setIsFlying(false);
            return totalFlightTime;
          }
          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isFlying, totalFlightTime]);

  // Current projectile coordinates
  const currentX = vx0 * simTime;
  const currentY = Math.max(0, vy0 * simTime - 0.5 * gravity * simTime * simTime);
  const currentVy = vy0 - gravity * simTime;

  // Draw Projectile Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark sky background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Ground plane line
    const groundY = height - 60;
    const originX = 60;

    // Determine coordinate scale so full range & max height fit comfortably
    const maxDimension = Math.max(totalRange * 1.2, maxHeight * 2.2, 50);
    const scale = (width - 120) / maxDimension;

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= maxDimension; x += 10) {
      const px = originX + x * scale;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, groundY);
      ctx.stroke();
    }
    for (let y = 0; y <= maxDimension; y += 10) {
      const py = groundY - y * scale;
      if (py > 0) {
        ctx.beginPath();
        ctx.moveTo(originX, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }
    }

    // Draw Ground
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Cannon Barrel
    const barrelLen = 35;
    const barrelX = originX + barrelLen * Math.cos(angleRad);
    const barrelY = groundY - barrelLen * Math.sin(angleRad);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(originX, groundY);
    ctx.lineTo(barrelX, barrelY);
    ctx.stroke();

    // Full Theoretical Parabolic Trajectory (dashed)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalFlightTime;
      const x = vx0 * t;
      const y = vy0 * t - 0.5 * gravity * t * t;

      const px = originX + x * scale;
      const py = groundY - y * scale;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Actual Trajectory Path traveled up to current simTime (solid cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let t = 0; t <= simTime; t += 0.05) {
      const x = vx0 * t;
      const y = vy0 * t - 0.5 * gravity * t * t;
      const px = originX + x * scale;
      const py = groundY - y * scale;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Apex Marker Point
    const apexPx = originX + (totalRange / 2) * scale;
    const apexPy = groundY - maxHeight * scale;

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(apexPx, apexPy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde68a';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`H_max = ${maxHeight.toFixed(1)}m`, apexPx, apexPy - 8);

    // Range Landing Point
    const landingPx = originX + totalRange * scale;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(landingPx, groundY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(`R = ${totalRange.toFixed(1)}m`, landingPx, groundY + 18);

    // Animated Projectile Cannonball
    const ballPx = originX + currentX * scale;
    const ballPy = groundY - currentY * scale;

    // Glowing cannonball
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(ballPx, ballPy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Instantaneous Velocity Vector Arrow
    const velScale = 1.2;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ballPx, ballPy);
    ctx.lineTo(ballPx + vx0 * velScale, ballPy - currentVy * velScale);
    ctx.stroke();
  }, [velocity, angleRad, gravity, totalFlightTime, maxHeight, totalRange, currentX, currentY, currentVy, simTime]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Launch Controls & Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Launch Ballistics
              </div>
              <div className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>v₀ = {velocity} m/s</span>
                <span className="text-slate-400">•</span>
                <span>θ = {angleDeg}°</span>
                <span className="text-slate-400">•</span>
                <span>g = {gravity} m/s²</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isFlying ? 'Re-Launch' : 'Fire Projectile'}</span>
            </button>
            <button
              onClick={() => {
                setSimTime(0);
                setIsFlying(false);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reset Projectile to Cannon"
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
            height={460}
            className="w-full h-auto block"
          />
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm">
            Time: {simTime.toFixed(2)}s / {totalFlightTime.toFixed(2)}s
          </div>
        </div>

        {/* Kinematic Telemetry Cards */}
        <div className="grid grid-cols-4 gap-3 font-mono text-xs text-center">
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Maximum Height (H)</div>
            <div className="text-amber-300 font-bold mt-0.5">{maxHeight.toFixed(2)} m</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Total Range (R)</div>
            <div className="text-emerald-300 font-bold mt-0.5">{totalRange.toFixed(2)} m</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Flight Time (T)</div>
            <div className="text-cyan-300 font-bold mt-0.5">{totalFlightTime.toFixed(2)} s</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Current (x, y)</div>
            <div className="text-indigo-300 font-bold mt-0.5">
              ({currentX.toFixed(1)}, {currentY.toFixed(1)}) m
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
          extraControls={
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Gravity Environments
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
                <button
                  onClick={() => {
                    setValue('gravity', 9.81);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-center"
                >
                  Earth (9.8)
                </button>
                <button
                  onClick={() => {
                    setValue('gravity', 1.62);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-center"
                >
                  Moon (1.6)
                </button>
                <button
                  onClick={() => {
                    setValue('gravity', 24.79);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-center"
                >
                  Jupiter (24.8)
                </button>
              </div>
            </div>
          }
        />

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            45° Max Range Principle
          </div>
          <p className="text-slate-300 leading-relaxed">
            Because horizontal range is proportional to <span className="text-cyan-300 font-mono">sin(2θ)</span>, launching at exactly 45° maximizes the sine factor (<span className="text-cyan-300 font-mono">sin(90°) = 1.0</span>), yielding the farthest theoretical trajectory.
          </p>
        </div>
      </div>
    </div>
  );
};
