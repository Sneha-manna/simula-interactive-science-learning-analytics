import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Zap, Play } from 'lucide-react';
import { SimulationControls } from '../components/SimulationControls';
import { SIMULATION_REGISTRY } from '../registry';

interface BohrAtomSimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
}

export const BohrAtomSim: React.FC<BohrAtomSimProps> = ({
  values,
  setValue,
  resetValues,
  incrementRunCount,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === 'chem-bohr-atom')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nInitial = Math.max(1, Math.min(5, Math.round(values.nInitial ?? 3)));
  const nFinal = Math.max(1, Math.min(5, Math.round(values.nFinal ?? 2)));

  // Quantum energy levels: E_n = -13.6 / n^2 eV
  const eInitial = -13.6 / (nInitial * nInitial);
  const eFinal = -13.6 / (nFinal * nFinal);
  const deltaE = Math.abs(eInitial - eFinal);

  // Photon wavelength: lambda = (h * c) / deltaE = 1240 eV·nm / deltaE
  const wavelengthNm = deltaE > 0.01 ? 1239.84 / deltaE : 0;
  const isEmission = nInitial > nFinal;

  // Electron orbit angle state
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Spectral series identification
  const getSeriesName = () => {
    const target = Math.min(nInitial, nFinal);
    if (target === 1) return 'Lyman Series (Ultraviolet)';
    if (target === 2) return 'Balmer Series (Visible Spectrum)';
    if (target === 3) return 'Paschen Series (Infrared)';
    return 'Brackett Series';
  };

  // Color of photon
  const getPhotonColor = (nm: number) => {
    if (nm < 380) return '#c084fc'; // UV (Purple)
    if (nm >= 380 && nm < 440) return '#818cf8'; // Violet/Indigo
    if (nm >= 440 && nm < 490) return '#38bdf8'; // Cyan
    if (nm >= 490 && nm < 570) return '#4ade80'; // Green
    if (nm >= 570 && nm < 590) return '#facc15'; // Yellow
    if (nm >= 590 && nm < 620) return '#fb923c'; // Orange
    if (nm >= 620 && nm <= 750) return '#f87171'; // Red
    return '#f43f5e'; // Infrared
  };

  // Trigger quantum leap
  const triggerTransition = () => {
    setTransitioning(true);
    incrementRunCount();
    setTimeout(() => setTransitioning(false), 1200);
  };

  // Animation frame for rotating electron
  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastStamp) / 1000;
      lastStamp = now;

      // Electron speed depends on quantum level
      const currentN = transitioning ? (nInitial + nFinal) / 2 : nFinal;
      const speed = 3.5 / currentN;

      setOrbitAngle((prev) => (prev + speed * dt) % (Math.PI * 2));
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [transitioning, nInitial, nFinal]);

  // Draw Bohr Atom Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Radii of Bohr orbits n=1 to 5 (scaled for display)
    const baseRadius = 32;
    const orbitRadii = [1, 2, 3, 4, 5].map((n) => baseRadius * Math.sqrt(n * 1.8));

    // Draw Orbits (concentric circles)
    orbitRadii.forEach((r, idx) => {
      const nLevel = idx + 1;
      const isLevelActive = nLevel === nInitial || nLevel === nFinal;

      ctx.strokeStyle = isLevelActive ? 'rgba(6, 182, 212, 0.6)' : 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = isLevelActive ? 2 : 1;
      ctx.setLineDash(isLevelActive ? [] : [3, 4]);

      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label orbit level n
      ctx.fillStyle = isLevelActive ? '#38bdf8' : '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`n=${nLevel}`, centerX + r, centerY - 6);
    });

    // Central Nucleus (Proton)
    const nucleusRadius = 14;
    const nucGlow = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, nucleusRadius * 2);
    nucGlow.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
    nucGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = nucGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('+1p', centerX, centerY + 4);

    // Active Electron Position
    const effectiveRadius = transitioning
      ? (orbitRadii[nInitial - 1] + orbitRadii[nFinal - 1]) / 2
      : orbitRadii[nFinal - 1];

    const electronX = centerX + effectiveRadius * Math.cos(orbitAngle);
    const electronY = centerY + effectiveRadius * Math.sin(orbitAngle);

    // Draw Electron
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(electronX, electronY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Photon wave packet (if transitioning or emission)
    if (transitioning && deltaE > 0.01) {
      const photonCol = getPhotonColor(wavelengthNm);
      ctx.strokeStyle = photonCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Wave packet shooting away
      for (let p = 0; p < 40; p += 2) {
        const px = electronX + p * (isEmission ? 1.5 : -1.5);
        const py = electronY - 20 + Math.sin(p * 0.4) * 8;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.fillStyle = photonCol;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`hν (${wavelengthNm.toFixed(0)} nm)`, electronX + 45, electronY - 25);
    }
  }, [orbitAngle, nInitial, nFinal, transitioning, deltaE, wavelengthNm, isEmission]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Transition Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Quantum Transition: n = {nInitial} → n = {nFinal}
              </div>
              <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
                <span>ΔE =</span>
                <span className="text-cyan-300">{deltaE.toFixed(2)} eV</span>
                <span className="text-xs text-slate-400">
                  (λ = {wavelengthNm > 0 ? `${wavelengthNm.toFixed(1)} nm` : 'N/A'})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={triggerTransition}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Emit / Absorb Photon</span>
          </button>
        </div>

        {/* Canvas */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={720}
            height={440}
            className="w-full h-auto block"
          />
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm">
            {getSeriesName()}
          </div>
        </div>

        {/* Emission Spectrum Indicator */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Balmer Series Visible Emission Spectrum</span>
            <span className="font-mono text-cyan-400">Hα (656nm), Hβ (486nm), Hγ (434nm), Hδ (410nm)</span>
          </div>

          <div className="h-6 w-full rounded-xl bg-slate-950 border border-slate-800 relative flex items-center px-4 overflow-hidden">
            {/* Spectral Lines */}
            <div className="absolute left-[78%] h-full w-1 bg-red-500 shadow-[0_0_8px_#ef4444]" title="H-alpha (656 nm)" />
            <div className="absolute left-[54%] h-full w-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" title="H-beta (486 nm)" />
            <div className="absolute left-[40%] h-full w-1 bg-blue-500 shadow-[0_0_8px_#3b82f6]" title="H-gamma (434 nm)" />
            <div className="absolute left-[32%] h-full w-1 bg-purple-500 shadow-[0_0_8px_#a855f7]" title="H-delta (410 nm)" />

            {/* Current photon indicator */}
            {wavelengthNm >= 380 && wavelengthNm <= 750 && (
              <div
                className="absolute h-full w-1.5 bg-white border border-slate-950 shadow-[0_0_12px_#ffffff]"
                style={{
                  left: `${((wavelengthNm - 380) / (750 - 380)) * 100}%`,
                }}
              />
            )}
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
                Famous Transitions
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  onClick={() => {
                    setValue('nInitial', 3);
                    setValue('nFinal', 2);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
                >
                  <div className="font-bold text-red-400">H-alpha (3 → 2)</div>
                  <div className="text-[10px] text-slate-400">656 nm (Red Light)</div>
                </button>
                <button
                  onClick={() => {
                    setValue('nInitial', 4);
                    setValue('nFinal', 2);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
                >
                  <div className="font-bold text-cyan-400">H-beta (4 → 2)</div>
                  <div className="text-[10px] text-slate-400">486 nm (Cyan Light)</div>
                </button>
                <button
                  onClick={() => {
                    setValue('nInitial', 2);
                    setValue('nFinal', 1);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
                >
                  <div className="font-bold text-purple-400">Lyman-alpha (2 → 1)</div>
                  <div className="text-[10px] text-slate-400">121 nm (UV)</div>
                </button>
                <button
                  onClick={() => {
                    setValue('nInitial', 4);
                    setValue('nFinal', 3);
                    incrementRunCount();
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left"
                >
                  <div className="font-bold text-amber-400">Paschen-alpha (4 → 3)</div>
                  <div className="text-[10px] text-slate-400">1875 nm (IR)</div>
                </button>
              </div>
            </div>
          }
        />

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
            The Rydberg Quantum Hypothesis
          </div>
          <p className="text-slate-300 leading-relaxed">
            Niels Bohr solved the mystery of sharp atomic spectral lines by postulating that electrons only occupy discrete, quantized angular momentum orbits. Energy is emitted or absorbed strictly as a single packet (photon) of light: <span className="text-cyan-300 font-mono">ΔE = hν = hc/λ</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
