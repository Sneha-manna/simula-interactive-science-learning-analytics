import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ControlDefinition } from '../../types/simulation';

interface SimulationControlsProps {
  controls: ControlDefinition[];
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
  onReset: () => void;
  extraControls?: React.ReactNode;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  controls,
  values,
  onChange,
  onReset,
  extraControls,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Experiment Parameters
          </h3>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
          title="Reset all parameters to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {controls.map((control) => {
          const val = values[control.id] ?? control.defaultValue;
          return (
            <div key={control.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor={`control-${control.id}`} className="font-medium text-slate-300">
                  {control.label}
                </label>
                <span className="font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-cyan-300 font-semibold">
                  {val} {control.unit || ''}
                </span>
              </div>
              <input
                id={`control-${control.id}`}
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={val}
                onChange={(e) => onChange(control.id, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{control.min}{control.unit}</span>
                <span>{control.max}{control.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {extraControls && (
        <div className="pt-2 border-t border-slate-800/80">
          {extraControls}
        </div>
      )}
    </div>
  );
};
