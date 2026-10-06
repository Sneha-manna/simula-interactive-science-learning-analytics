import React, { useRef, useEffect } from 'react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface QuadraticSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const QuadraticSim: React.FC<QuadraticSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'math-quadratic')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const a = values.a ?? 1;
  const b = values.b ?? -2;
  const c = values.c ?? -3;

  // Vertex: x_v = -b / (2a), y_v = a*x_v^2 + b*x_v + c
  const effectiveA = Math.abs(a) < 0.001 ? 0.001 : a;
  const vertexX = -b / (2 * effectiveA);
  const vertexY = effectiveA * vertexX * vertexX + b * vertexX + c;

  // Discriminant: Δ = b^2 - 4ac
  const discriminant = b * b - 4 * effectiveA * c;

  // Roots
  let roots: number[] = [];
  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    roots = [(-b + sqrtD) / (2 * effectiveA), (-b - sqrtD) / (2 * effectiveA)].sort((x, y) => x - y);
  } else if (Math.abs(discriminant) < 0.0001) {
    roots = [-b / (2 * effectiveA)];
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 26; // pixels per Cartesian unit

    ctx.clearRect(0, 0, width, height);

    // Dark canvas background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Coordinate grid
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

    // Main Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let uX = -12; uX <= 12; uX += 2) {
      if (uX === 0) continue;
      const px = centerX + uX * scale;
      if (px > 0 && px < width) ctx.fillText(uX.toString(), px, centerY + 12);
    }
    ctx.textAlign = 'right';
    for (let uY = -8; uY <= 8; uY += 2) {
      if (uY === 0) continue;
      const py = centerY - uY * scale;
      if (py > 0 && py < height) ctx.fillText(uY.toString(), centerX - 6, py + 3);
    }

    // Axis of Symmetry (dashed line x = vertexX)
    const vPx = centerX + vertexX * scale;
    if (vPx >= 0 && vPx <= width) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(vPx, 0);
      ctx.lineTo(vPx, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`x = ${vertexX.toFixed(2)}`, vPx + 5, 20);
    }

    // Parabola Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const mathX = (px - centerX) / scale;
      const mathY = effectiveA * mathX * mathX + b * mathX + c;
      const py = centerY - mathY * scale;

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Vertex Point
    const vPy = centerY - vertexY * scale;
    if (vPx >= 0 && vPx <= width && vPy >= 0 && vPy <= height) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(vPx, vPy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = vertexX >= 0 ? 'right' : 'left';
      ctx.fillText(`Vertex (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`, vPx + (vertexX >= 0 ? -12 : 12), vPy - 10);
    }

    // Roots Points on X-Axis
    roots.forEach((r, idx) => {
      const rPx = centerX + r * scale;
      if (rPx >= 0 && rPx <= width) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(rPx, centerY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Root ${idx + 1}: ${r.toFixed(2)}`, rPx, centerY + 22);
      }
    });
  }, [effectiveA, b, c, vertexX, vertexY, roots]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Equation & Discriminant Info */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">
              Function:
            </span>
            <div className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 font-mono text-base md:text-lg font-black text-cyan-300">
              y = {a}x² {b >= 0 ? '+' : '-'} {Math.abs(b)}x {c >= 0 ? '+' : '-'} {Math.abs(c)}
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
              Δ = {discriminant.toFixed(2)}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg border ${
                discriminant > 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : discriminant === 0
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {discriminant > 0
                ? '2 Real Roots'
                : discriminant === 0
                ? '1 Repeated Root'
                : 'No Real Roots'}
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
            Parabola Plotter
          </div>
        </div>

        {/* Analytical Properties Cards */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Parabola Direction</div>
            <div className="text-cyan-300 font-bold mt-0.5">
              {a > 0 ? 'Opens Upward (U)' : 'Opens Downward (∩)'}
            </div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Vertex Coordinate</div>
            <div className="text-amber-300 font-bold mt-0.5">
              ({vertexX.toFixed(2)}, {vertexY.toFixed(2)})
            </div>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">Real Roots</div>
            <div className="text-emerald-300 font-bold mt-0.5">
              {roots.length > 0 ? roots.map((r) => r.toFixed(2)).join(', ') : 'None (Complex)'}
            </div>
          </div>
        </div>
      </div>

      {/* Right Col: Controls & Presets */}
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
                Standard Scenarios
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  onClick={() => {
                    setValue('a', 1);
                    setValue('b', -2);
                    setValue('c', -3);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  Two Real Roots (Δ &gt; 0)
                </button>
                <button
                  onClick={() => {
                    setValue('a', 1);
                    setValue('b', -4);
                    setValue('c', 4);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  Tangent Root (Δ = 0)
                </button>
                <button
                  onClick={() => {
                    setValue('a', 1);
                    setValue('b', 0);
                    setValue('c', 3);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  Complex Roots (Δ &lt; 0)
                </button>
                <button
                  onClick={() => {
                    setValue('a', -1);
                    setValue('b', 2);
                    setValue('c', 3);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  Inverted (a &lt; 0)
                </button>
              </div>
            </div>
          }
        />

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
            The Role of Discriminant (Δ)
          </div>
          <p className="text-slate-300 leading-relaxed">
            When <span className="text-amber-300 font-mono">b² - 4ac &gt; 0</span>, the square root yields a real positive number, giving two distinct intersections with the x-axis. When it equals 0, the vertex grazes the x-axis. When negative, the parabola sits entirely above or below the axis.
          </p>
        </div>
      </div>
    </div>
  );
};
