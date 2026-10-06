import React, { useRef, useEffect } from 'react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface CalculusDerivativeSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const CalculusDerivativeSim: React.FC<CalculusDerivativeSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'math-calculus-derivative')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const x0 = values.x0 ?? 1;
  const deltaX = values.deltaX ?? 0.8;
  const power = Math.round(values.power ?? 2);

  // Function definition: f(x) = x^power
  const f = (x: number) => {
    if (power === 1) return x;
    if (power === 2) return 0.5 * x * x; // scaled for visibility
    return 0.2 * Math.pow(x, 3);
  };

  // Derivative definition: f'(x)
  const fPrime = (x: number) => {
    if (power === 1) return 1;
    if (power === 2) return x;
    return 0.6 * Math.pow(x, 2);
  };

  const y0 = f(x0);
  const x1 = x0 + deltaX;
  const y1 = f(x1);

  // Secant slope vs Tangent slope
  const secantSlope = (y1 - y0) / deltaX;
  const tangentSlope = fPrime(x0);
  const approximationError = Math.abs(secantSlope - tangentSlope);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 + 50;
    const scale = 36; // pixels per unit

    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = centerX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = centerY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Axis numbers
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let ux = -8; ux <= 8; ux += 1) {
      if (ux === 0) continue;
      const px = centerX + ux * scale;
      if (px > 0 && px < width) ctx.fillText(ux.toString(), px, centerY + 12);
    }

    // Plot Function Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const mx = (px - centerX) / scale;
      const my = f(mx);
      const py = centerY - my * scale;

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Secant Line (through (x0, y0) and (x1, y1))
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    const secantXMin = -8;
    const secantXMax = 8;
    const secantYStart = y0 + secantSlope * (secantXMin - x0);
    const secantYEnd = y0 + secantSlope * (secantXMax - x0);

    ctx.beginPath();
    ctx.moveTo(centerX + secantXMin * scale, centerY - secantYStart * scale);
    ctx.lineTo(centerX + secantXMax * scale, centerY - secantYEnd * scale);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tangent Line (exact derivative at (x0, y0))
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;

    const tanYStart = y0 + tangentSlope * (secantXMin - x0);
    const tanYEnd = y0 + tangentSlope * (secantXMax - x0);

    ctx.beginPath();
    ctx.moveTo(centerX + secantXMin * scale, centerY - tanYStart * scale);
    ctx.lineTo(centerX + secantXMax * scale, centerY - tanYEnd * scale);
    ctx.stroke();

    // Plot Point (x0, y0)
    const p0x = centerX + x0 * scale;
    const p0y = centerY - y0 * scale;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(p0x, p0y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`P₀(${x0.toFixed(2)}, ${y0.toFixed(2)})`, p0x - 10, p0y - 10);

    // Plot Point (x1, y1)
    const p1x = centerX + x1 * scale;
    const p1y = centerY - y1 * scale;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(p1x, p1y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`P₁(${x1.toFixed(2)}, ${y1.toFixed(2)})`, p1x + 10, p1y - 10);

    // Δx and Δy projection lines
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.lineTo(p1x, p0y); // Δx run
    ctx.lineTo(p1x, p1y); // Δy rise
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Δx = ${deltaX.toFixed(2)}`, (p0x + p1x) / 2, p0y + 14);
    ctx.textAlign = 'left';
    ctx.fillText(`Δy = ${(y1 - y0).toFixed(2)}`, p1x + 6, (p0y + p1y) / 2);
  }, [x0, deltaX, power, y0, y1, secantSlope, tangentSlope]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Derivative Comparison Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">
              Function:
            </span>
            <div className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 font-mono text-base font-black text-cyan-300">
              f(x) = {power === 1 ? 'x' : power === 2 ? '½ x²' : '0.2 x³'}
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              Exact Tangent f’(x₀) = {tangentSlope.toFixed(3)}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
              Secant (Δy/Δx) = {secantSlope.toFixed(3)}
            </span>
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
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 backdrop-blur-sm">
            Secant → Tangent Limiting Canvas
          </div>
        </div>

        {/* Analytical Diagnostics */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Secant Step (Δx)</div>
            <div className="text-amber-300 font-bold mt-0.5">{deltaX.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Approximation Error</div>
            <div className={`font-bold mt-0.5 ${approximationError < 0.05 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {approximationError.toFixed(4)}
            </div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Limit Convergence</div>
            <div className="text-cyan-300 font-bold mt-0.5">
              {deltaX <= 0.1 ? 'Locked on Tangent' : 'Approaching'}
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
            The Limit Definition of Derivative
          </div>
          <p className="text-slate-300 leading-relaxed">
            Drag the <span className="text-amber-300 font-mono font-bold">Secant Step Δx</span> slider toward 0.05. Watch how the dashed orange line aligns completely with the solid green instantaneous tangent line as <span className="text-cyan-300 font-mono">Δx → 0</span>!
          </p>
        </div>
      </div>
    </div>
  );
};
