import React from 'react';
import { SIMULATION_REGISTRY } from '../../simulations/registry';
import { SimulationContainer } from '../../simulations/components/SimulationContainer';

// Math Simulations
import { LinearEquationSim } from '../../simulations/mathematics/LinearEquationSim';
import { QuadraticSim } from '../../simulations/mathematics/QuadraticSim';
import { TrigWaveSim } from '../../simulations/mathematics/TrigWaveSim';
import { ProbabilitySim } from '../../simulations/mathematics/ProbabilitySim';
import { CalculusDerivativeSim } from '../../simulations/mathematics/CalculusDerivativeSim';

// Physics Simulations
import { OhmsLawSim } from '../../simulations/physics/OhmsLawSim';
import { ProjectileSim } from '../../simulations/physics/ProjectileSim';
import { PendulumSim } from '../../simulations/physics/PendulumSim';
import { SpringMassSim } from '../../simulations/physics/SpringMassSim';
import { WaveMotionSim } from '../../simulations/physics/WaveMotionSim';

// Chemistry Simulations
import { ChemistryRouter } from '../../simulations/chemistry/ChemistryRouter';

interface SimulationViewProps {
  simulationId: string;
  onBack: () => void;
  onNavigateToSim: (simId: string) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  simulationId,
  onBack,
  onNavigateToSim,
}) => {
  const metadata = SIMULATION_REGISTRY.find((s) => s.id === simulationId);

  if (!metadata) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Simulation Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested experiment with ID "{simulationId}" does not exist in the registry.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <SimulationContainer
      metadata={metadata}
      onBack={onBack}
      onNavigateToSim={onNavigateToSim}
    >
      {(simProps) => {
        // Handle all Chemistry Simulations through ChemistryRouter
        if (metadata.subject === 'chemistry' || metadata.id.startsWith('chem-')) {
          return <ChemistryRouter {...simProps} metadata={metadata} />;
        }

        switch (metadata.id) {
          // Mathematics
          case 'math-linear-equation':
            return <LinearEquationSim {...simProps} />;
          case 'math-quadratic':
            return <QuadraticSim {...simProps} />;
          case 'math-trig-wave':
            return <TrigWaveSim {...simProps} />;
          case 'math-probability':
            return <ProbabilitySim {...simProps} />;
          case 'math-calculus-derivative':
            return <CalculusDerivativeSim {...simProps} />;

          // Physics
          case 'physics-ohms-law':
            return <OhmsLawSim {...simProps} />;
          case 'physics-projectile':
            return <ProjectileSim {...simProps} />;
          case 'physics-pendulum':
            return <PendulumSim {...simProps} />;
          case 'physics-spring-mass':
            return <SpringMassSim {...simProps} />;
          case 'physics-wave-motion':
            return <WaveMotionSim {...simProps} />;

          default:
            return (
              <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
                <p className="text-sm font-semibold text-slate-200">
                  Simulation "{metadata.title}" is in development.
                </p>
                <p className="text-xs text-slate-400">
                  Refer to the Theory and Assessment tabs for full mathematical content.
                </p>
              </div>
            );
        }
      }}
    </SimulationContainer>
  );
};
