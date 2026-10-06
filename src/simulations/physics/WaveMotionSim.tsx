import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Waves, Radio } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface WaveMotionSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const WaveMotionSim: React.FC<WaveMotionSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'physics-wave-motion')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const freq1 = values.freq1 ?? 1.5;
  const freq2 = values.freq2 ?? 1.5;
  const amplitude = values.amplitude ?? 1.5;
  const phaseDiff = values.phaseDiff ?? 0;

  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  // Beat frequency
  const beatFreq = Math.abs(freq1 - freq2);

  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastStamp) / 1000;
      lastStamp = now;

      if (isPlaying) {
        setTime((prev) => prev + dt * 2.5);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Draw Waves Canvas
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

    // Three horizontal sections: Wave 1, Wave 2, Resultant (Superposition)
    const ySection1 = height * 0.22;
    const ySection2 = height * 0.50;
    const yResultant = height * 0.80;

    // Baselines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    [ySection1, ySection2, yResultant].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 30, y);
      ctx.stroke();
    });

    const scaleK = 0.035; // spatial wavevector
    const scaleAmp = 18;

    // Wave 1: y1 = A * sin(k*x - omega1*t)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 30; x <= width - 30; x += 2) {
      const val = amplitude * Math.sin(scaleK * x - freq1 * time);
      const py = ySection1 - val * scaleAmp;
      if (x === 30) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`Wave 1: f₁ = ${freq1.toFixed(1)} Hz`, 35, ySection1 - 25);

    // Wave 2: y2 = A * sin(k*x - omega2*t + phi)
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 30; x <= width - 30; x += 2) {
      const val = amplitude * Math.sin(scaleK * x - freq2 * time + phaseDiff);
      const py = ySection2 - val * scaleAmp;
      if (x === 30) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#c084fc';
    ctx.fillText(`Wave 2: f₂ = ${freq2.toFixed(1)} Hz (Δφ = ${phaseDiff.toFixed(2)} rad)`, 35, ySection2 - 25);

    // Resultant Superposition Wave: y_net = y1 + y2
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 30; x <= width - 30; x += 2) {
      const v1 = amplitude * Math.sin(scaleK * x - freq1 * time);
      const v2 = amplitude * Math.sin(scaleK * x - freq2 * time + phaseDiff);
      const py = yResultant - (v1 + v2) * scaleAmp;
      if (x === 30) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(`Superposition Resultant: y_net = y₁ + y₂`, 35, yResultant - 35);
  }, [amplitude, freq1, freq2, phaseDiff, time]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Interference Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Superposition Principle
              </div>
              <div className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Interference:</span>
                <span className={`font-mono ${Math.abs(phaseDiff - Math.PI) < 0.2 && Math.abs(freq1 - freq2) < 0.05 ? 'text-rose-400' : Math.abs(phaseDiff) < 0.2 ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {Math.abs(phaseDiff - Math.PI) < 0.2 && Math.abs(freq1 - freq2) < 0.05
                    ? 'Destructive Cancellation (0)'
                    : Math.abs(phaseDiff) < 0.2 && Math.abs(freq1 - freq2) < 0.05
                    ? 'Constructive Reinforcement (2A)'
                    : beatFreq > 0.05
                    ? `Beating Pattern (${beatFreq.toFixed(2)} Hz)`
                    : 'Phase-Shifted Superposition'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Pause Waves' : 'Resume'}</span>
          </button>
        </div>

        {/* Canvas */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={720}
            height={460}
            className="w-full h-auto block"
          />
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 backdrop-blur-sm">
            Dual Oscillator Superposition Canvas
          </div>
        </div>

        {/* Presets */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Interference Configurations
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs font-medium">
            <button
              onClick={() => {
                setValue('freq1', 1.5);
                setValue('freq2', 1.5);
                setValue('phaseDiff', 0);
                incrementRunCount();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
            >
              <div className="font-bold text-emerald-400">Pure Constructive</div>
              <div className="text-[10px] text-slate-400">In-phase (Δφ = 0, f₁ = f₂)</div>
            </button>
            <button
              onClick={() => {
                setValue('freq1', 1.5);
                setValue('freq2', 1.5);
                setValue('phaseDiff', 3.14);
                incrementRunCount();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
            >
              <div className="font-bold text-rose-400">Pure Destructive</div>
              <div className="text-[10px] text-slate-400">Out-of-phase (Δφ = π)</div>
            </button>
            <button
              onClick={() => {
                setValue('freq1', 2.0);
                setValue('freq2', 2.3);
                setValue('phaseDiff', 0);
                incrementRunCount();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
            >
              <div className="font-bold text-cyan-400">Acoustic Beats</div>
              <div className="text-[10px] text-slate-400">Close freqs (f_beat = 0.3 Hz)</div>
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
          <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            Principle of Superposition
          </div>
          <p className="text-slate-300 leading-relaxed">
            When two traveling waves intersect in space, the resultant displacement is the algebraic sum of their individual amplitudes: <span className="text-emerald-300 font-mono">y_net(x,t) = y₁(x,t) + y₂(x,t)</span>. Notice how setting <span className="text-rose-400 font-mono">Δφ = π (180°)</span> causes total cancellation.
          </p>
        </div>
      </div>
    </div>
  );
};
