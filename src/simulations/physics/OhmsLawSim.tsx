import React, { useRef, useEffect, useState } from 'react';
import { Zap, AlertTriangle, Lightbulb, Play, Pause } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface OhmsLawSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const OhmsLawSim: React.FC<OhmsLawSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'physics-ohms-law')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [electronOffset, setElectronOffset] = useState(0);

  const voltage = values.voltage ?? 12;
  const resistance = Math.max(1, values.resistance ?? 20);

  // Ohm's Law calculations: I = V / R, P = V * I
  const current = voltage / resistance;
  const power = voltage * current;

  // Animation loop for electron drift
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        // Drift speed scales with current
        const speed = Math.min(180, current * 45);
        setElectronOffset((prev) => (prev + speed * dt) % 1000);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, current]);

  // Draw Circuit Schematic Canvas
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

    // Circuit coordinates (rectangular loop)
    const left = 100;
    const right = width - 100;
    const top = 80;
    const bottom = height - 80;

    // Draw main copper wires
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Top wire (interrupted by Resistor in the middle)
    ctx.moveTo(left, top);
    ctx.lineTo(left + (right - left) * 0.35, top);

    ctx.moveTo(left + (right - left) * 0.65, top);
    ctx.lineTo(right, top);

    // Right wire (interrupted by Lightbulb in the middle)
    ctx.moveTo(right, top);
    ctx.lineTo(right, top + (bottom - top) * 0.35);

    ctx.moveTo(right, top + (bottom - top) * 0.65);
    ctx.lineTo(right, bottom);

    // Bottom wire
    ctx.moveTo(right, bottom);
    ctx.lineTo(left, bottom);

    // Left wire (interrupted by DC Battery in the middle)
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top + (bottom - top) * 0.6);

    ctx.moveTo(left, top + (bottom - top) * 0.4);
    ctx.lineTo(left, top);

    ctx.stroke();

    // 1. Draw DC Battery on Left Wire
    const batteryY = (top + bottom) / 2;
    // Long plate (Positive +)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left - 20, batteryY - 14);
    ctx.lineTo(left + 20, batteryY - 14);
    ctx.stroke();

    // Short thick plate (Negative -)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(left - 12, batteryY + 14);
    ctx.lineTo(left + 12, batteryY + 14);
    ctx.stroke();

    // Battery labels
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('+', left - 28, batteryY - 10);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('–', left - 28, batteryY + 18);
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V DC`, left - 35, batteryY + 4);

    // 2. Draw Resistor on Top Wire
    const resistorX1 = left + (right - left) * 0.35;
    const resistorX2 = left + (right - left) * 0.65;
    const resY = top;

    // Resistor body rectangle
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.fillRect(resistorX1, resY - 14, resistorX2 - resistorX1, 28);
    ctx.strokeRect(resistorX1, resY - 14, resistorX2 - resistorX1, 28);

    // Resistor Color Bands
    const bandWidth = 7;
    const bandSpacing = (resistorX2 - resistorX1) / 5;
    const bandColors = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b'];
    bandColors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(resistorX1 + (idx + 1) * bandSpacing - bandWidth / 2, resY - 13, bandWidth, 26);
    });

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`R = ${resistance} Ω`, (resistorX1 + resistorX2) / 2, resY - 22);

    // 3. Draw Light Bulb on Right Wire
    const bulbX = right;
    const bulbY = (top + bottom) / 2;

    // Bulb glow intensity depends on power (0 to 1)
    const glowIntensity = Math.min(1, power / 15);
    const glowRadius = 25 + glowIntensity * 45;

    // Outer radial glow
    const radialGrad = ctx.createRadialGradient(bulbX, bulbY, 5, bulbX, bulbY, glowRadius);
    radialGrad.addColorStop(0, `rgba(251, 191, 36, ${0.8 * glowIntensity})`);
    radialGrad.addColorStop(0.5, `rgba(245, 158, 11, ${0.4 * glowIntensity})`);
    radialGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = radialGrad;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bulb glass circle
    ctx.fillStyle = glowIntensity > 0.1 ? `rgba(254, 240, 138, ${0.2 + 0.6 * glowIntensity})` : '#1e293b';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bulb filament cross
    ctx.strokeStyle = glowIntensity > 0.3 ? '#ffffff' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bulbX - 8, bulbY + 8);
    ctx.lineTo(bulbX, bulbY - 6);
    ctx.lineTo(bulbX + 8, bulbY + 8);
    ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Load Bulb (${power.toFixed(1)}W)`, bulbX + 30, bulbY + 4);

    // 4. Draw Animated Free Electrons (Drift current)
    // Parametric circuit loop length
    const segTop = right - left;
    const segRight = bottom - top;
    const segBottom = right - left;
    const segLeft = bottom - top;
    const totalLoop = segTop + segRight + segBottom + segLeft;

    const electronCount = 28;
    for (let i = 0; i < electronCount; i++) {
      const basePos = ((i / electronCount) * totalLoop + electronOffset) % totalLoop;

      let ex = left;
      let ey = top;

      if (basePos < segTop) {
        // Top segment (left to right)
        ex = left + basePos;
        ey = top;
      } else if (basePos < segTop + segRight) {
        // Right segment (top to bottom)
        ex = right;
        ey = top + (basePos - segTop);
      } else if (basePos < segTop + segRight + segBottom) {
        // Bottom segment (right to left)
        ex = right - (basePos - segTop - segRight);
        ey = bottom;
      } else {
        // Left segment (bottom to top)
        ex = left;
        ey = bottom - (basePos - segTop - segRight - segBottom);
      }

      // Draw electron dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [voltage, resistance, power, electronOffset]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Calculations Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Ohm’s Law: I = V / R
              </div>
              <div className="text-xl font-black font-mono text-cyan-300">
                I = {voltage}V / {resistance}Ω = {current.toFixed(3)} A ({(current * 1000).toFixed(1)} mA)
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Pause Drift' : 'Resume Drift'}</span>
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
            Live Closed Circuit Schematic
          </div>
        </div>

        {/* Real-time Diagnostics Bar */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Voltage (Potential)</div>
            <div className="text-cyan-300 font-bold mt-0.5">{voltage.toFixed(1)} Volts</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Electric Current (I)</div>
            <div className="text-emerald-300 font-bold mt-0.5">{current.toFixed(3)} Amps</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Dissipated Power (P = VI)</div>
            <div className="text-amber-300 font-bold mt-0.5">{power.toFixed(2)} Watts</div>
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
            <Lightbulb className="w-3.5 h-3.5" />
            Physical Interpretation
          </div>
          <p className="text-slate-300 leading-relaxed">
            The blue dots represent conduction band electrons. As you increase the <span className="text-cyan-300 font-mono font-bold">Voltage (V)</span>, the electric field strength drives the drift velocity faster. Increasing <span className="text-amber-300 font-mono font-bold">Resistance (R)</span> impedes the electron flow, dimming the lightbulb.
          </p>
        </div>
      </div>
    </div>
  );
};
