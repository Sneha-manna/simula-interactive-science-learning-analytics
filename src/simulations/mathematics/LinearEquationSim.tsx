import React, { useRef, useEffect, useState } from 'react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface LinearEquationSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const LinearEquationSim: React.FC<LinearEquationSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'math-linear-equation')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const slope = values.slope ?? 1.5;
  const intercept = values.intercept ?? 2;

  // Root calculation
  const hasRoot = Math.abs(slope) > 0.001;
  const rootX = hasRoot ? -intercept / slope : null;

  // Draw Cartesian coordinate system & line
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate space mapping: center at (width/2, height/2), scale: 28px per unit
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 28;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Vertical grid lines & ticks
    for (let x = centerX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // Horizontal grid lines
    for (let y = centerY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Main Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Numbers on axes
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let unitX = -10; unitX <= 10; unitX += 2) {
      if (unitX === 0) continue;
      const px = centerX + unitX * scale;
      if (px >= 0 && px <= width) {
        ctx.fillText(unitX.toString(), px, centerY + 4);
      }
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let unitY = -8; unitY <= 8; unitY += 2) {
      if (unitY === 0) continue;
      const py = centerY - unitY * scale;
      if (py >= 0 && py <= height) {
        ctx.fillText(unitY.toString(), centerX - 6, py);
      }
    }

    // Slope Triangle (Rise & Run from x=0 to x=2)
    const triX1 = 0;
    const triX2 = 2;
    const triY1 = intercept;
    const triY2 = slope * 2 + intercept;

    const pX1 = centerX + triX1 * scale;
    const pY1 = centerY - triY1 * scale;
    const pX2 = centerX + triX2 * scale;
    const pY2 = centerY - triY2 * scale;

    // Draw triangle
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(pX1, pY1);
    ctx.lineTo(pX2, pY1); // Run
    ctx.lineTo(pX2, pY2); // Rise
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Labels for Rise & Run
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Run = +2', (pX1 + pX2) / 2, pY1 + (slope >= 0 ? 14 : -14));
    ctx.textAlign = 'left';
    ctx.fillText(`Rise = ${(slope * 2).toFixed(2)}`, pX2 + 6, (pY1 + pY2) / 2);

    // Plot Linear Function: y = slope * x + intercept
    // Find intersections with canvas boundaries
    const xMin = -centerX / scale;
    const xMax = (width - centerX) / scale;

    const yStart = slope * xMin + intercept;
    const yEnd = slope * xMax + intercept;

    const pyStart = centerY - yStart * scale;
    const pyEnd = centerY - yEnd * scale;

    // Draw Line
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, pyStart);
    ctx.lineTo(width, pyEnd);
    ctx.stroke();

    // Plot Points: Y-intercept (0, c)
    const interceptPx = centerX;
    const interceptPy = centerY - intercept * scale;

    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(interceptPx, interceptPy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Y-int (0, ${intercept})`, interceptPx + 10, interceptPy - 8);

    // Plot Root: X-intercept (-c/m, 0)
    if (rootX !== null && Math.abs(rootX) < 15) {
      const rootPx = centerX + rootX * scale;
      const rootPy = centerY;

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(rootPx, rootPy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Root (${rootX.toFixed(2)}, 0)`, rootPx, rootPy + 18);
    }
  }, [slope, intercept, rootX]);

  // Formatted equation
  const formattedEquation = () => {
    const sign = intercept >= 0 ? '+' : '-';
    const absIntercept = Math.abs(intercept);
    return `y = ${slope}x ${sign} ${absIntercept}`;
  };

  // Sample points table
  const samplePoints = [-2, -1, 0, 1, 2].map((x) => ({
    x,
    y: (slope * x + intercept).toFixed(2),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Interactive Canvas & Dynamic Display */}
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Formula Display Banner */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">
              Current Function:
            </span>
            <div className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 font-mono text-lg font-extrabold text-cyan-300">
              {formattedEquation()}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300">
              Y-int: (0, {intercept})
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              Root: {rootX !== null ? `(${rootX.toFixed(2)}, 0)` : 'None'}
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
            Cartesian Plane [-10, 10]
          </div>
        </div>

        {/* Coordinate Points Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Generated Coordinate Values (f(x) = {slope}x {intercept >= 0 ? '+' : '-'} {Math.abs(intercept)})
          </span>
          <div className="grid grid-cols-5 gap-2 text-center font-mono text-xs">
            {samplePoints.map((pt) => (
              <div key={pt.x} className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="text-slate-500 text-[10px]">x = {pt.x}</div>
                <div className="text-cyan-300 font-bold mt-0.5">y = {pt.y}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Col: Interactive Controls & Presets */}
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
                Quick Presets
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  onClick={() => {
                    setValue('slope', 1);
                    setValue('intercept', 0);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  y = x (Identity)
                </button>
                <button
                  onClick={() => {
                    setValue('slope', -2);
                    setValue('intercept', 4);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  y = -2x + 4
                </button>
                <button
                  onClick={() => {
                    setValue('slope', 0);
                    setValue('intercept', 3);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  y = 3 (Horizontal)
                </button>
                <button
                  onClick={() => {
                    setValue('slope', 3.5);
                    setValue('intercept', -5);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  Steep Incline
                </button>
              </div>
            </div>
          }
        />

        {/* Experiment Observation Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-cyan-400">
            Experiment Observation Note
          </div>
          <p className="text-slate-300 leading-relaxed">
            Notice how altering <span className="text-cyan-300 font-mono font-bold">slope (m)</span> causes the line to pivot around the purple y-intercept point <span className="text-purple-300 font-mono">(0, {intercept})</span>, while sliding <span className="text-purple-300 font-mono font-bold">c</span> translates the entire line up or down without changing its direction.
          </p>
        </div>
      </div>
    </div>
  );
};
