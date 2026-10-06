import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface TrigWaveSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const TrigWaveSim: React.FC<TrigWaveSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'math-trig-wave')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [useCosine, setUseCosine] = useState(false);
  const [time, setTime] = useState(0);

  const amplitude = values.amplitude ?? 2;
  const frequency = values.frequency ?? 1;
  const phase = values.phase ?? 0;
  const offset = values.offset ?? 0;

  // Period T = 2π / B
  const period = (2 * Math.PI) / Math.max(0.1, frequency);

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        setTime((prev) => prev + dt * 1.8);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Render Unit Circle + Harmonic Sine Wave
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

    // Partition canvas: Left 220px is Unit Circle, Right remainder is Wave Plot
    const circleCenterX = 110;
    const centerY = height / 2 - offset * 25;
    const circleRadius = Math.min(65, amplitude * 25);
    const waveStartX = 230;

    // Unit Circle background grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(circleCenterX - 90, centerY);
    ctx.lineTo(circleCenterX + 90, centerY);
    ctx.moveTo(circleCenterX, centerY - 90);
    ctx.lineTo(circleCenterX, centerY + 90);
    ctx.stroke();

    // Unit circle outline
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(circleCenterX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating phasor angle
    const angle = frequency * time - phase;
    const phasorX = circleCenterX + circleRadius * Math.cos(angle);
    const phasorY = centerY - circleRadius * (useCosine ? Math.cos(angle) : Math.sin(angle));

    // Phasor vector line
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(circleCenterX, centerY);
    ctx.lineTo(phasorX, phasorY);
    ctx.stroke();

    // Rotating point on circle
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(phasorX, phasorY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Divider line between Circle and Wave
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(waveStartX - 15, 20);
    ctx.lineTo(waveStartX - 15, height - 20);
    ctx.stroke();

    // Wave Baseline (Axis)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(waveStartX, centerY);
    ctx.lineTo(width - 20, centerY);
    ctx.stroke();

    // Horizontal Projector Line from Circle to Wave Origin
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(phasorX, phasorY);
    ctx.lineTo(waveStartX, phasorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw the continuous Sine/Cosine wave
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();

    const scaleX = 45; // pixels per radian along x
    const scaleY = 25; // pixels per unit amplitude

    let first = true;
    for (let xPx = waveStartX; xPx <= width - 20; xPx += 2) {
      const spatialX = (xPx - waveStartX) / scaleX;
      // wave function: y = A * sin(B*(spatialX + time) - C)
      const input = frequency * (spatialX + time) - phase;
      const waveVal = useCosine ? Math.cos(input) : Math.sin(input);
      const yPx = centerY - (amplitude * waveVal) * scaleY;

      if (first) {
        ctx.moveTo(xPx, yPx);
        first = false;
      } else {
        ctx.lineTo(xPx, yPx);
      }
    }
    ctx.stroke();

    // Leading contact point at wave start
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(waveStartX, phasorY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Period Indicator bar
    const periodPx = period * scaleX;
    if (waveStartX + periodPx < width - 40) {
      const barY = height - 30;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(waveStartX, barY);
      ctx.lineTo(waveStartX + periodPx, barY);
      ctx.stroke();

      // Tick markers at period ends
      ctx.beginPath();
      ctx.moveTo(waveStartX, barY - 4);
      ctx.lineTo(waveStartX, barY + 4);
      ctx.moveTo(waveStartX + periodPx, barY - 4);
      ctx.lineTo(waveStartX + periodPx, barY + 4);
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Period T = ${period.toFixed(2)}s (2π / B)`, waveStartX + periodPx / 2, barY - 6);
    }
  }, [amplitude, frequency, phase, offset, time, useCosine, period]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Formula Display */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">
              Harmonic Equation:
            </span>
            <div className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 font-mono text-base md:text-lg font-black text-cyan-300">
              y = {amplitude} · {useCosine ? 'cos' : 'sin'}({frequency}x {phase >= 0 ? '-' : '+'} {Math.abs(phase).toFixed(2)}) {offset !== 0 ? `${offset >= 0 ? '+' : '-'} ${Math.abs(offset)}` : ''}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? 'Pause Wave' : 'Resume Wave'}</span>
            </button>
            <button
              onClick={() => setUseCosine(!useCosine)}
              className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 transition-colors"
            >
              Switch to {useCosine ? 'Sine (sin)' : 'Cosine (cos)'}
            </button>
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
          <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
            Unit Phasor Circle
          </div>
          <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
            Harmonic Wave Propagation
          </div>
        </div>

        {/* Mathematical Parameters Grid */}
        <div className="grid grid-cols-4 gap-3 font-mono text-xs text-center">
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Amplitude (A)</div>
            <div className="text-cyan-300 font-bold mt-0.5">{amplitude} units</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Angular Freq (B)</div>
            <div className="text-indigo-300 font-bold mt-0.5">{frequency} rad/s</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Period (T = 2π/B)</div>
            <div className="text-amber-300 font-bold mt-0.5">{period.toFixed(2)} s</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Phase Shift (C)</div>
            <div className="text-purple-300 font-bold mt-0.5">{phase.toFixed(2)} rad</div>
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
            Unit Circle &amp; Sine Equivalence
          </div>
          <p className="text-slate-300 leading-relaxed">
            As the phasor dot orbits the circle with radius <span className="text-cyan-300 font-mono">A</span>, its vertical height maps directly to the sine amplitude. Frequency <span className="text-indigo-300 font-mono">B</span> speeds up the rotation rate, shortening the spatial wavelength.
          </p>
        </div>
      </div>
    </div>
  );
};
