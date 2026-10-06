import React from 'react';
import { SimulationMetadata } from '../../types/simulation';
import { AcidsBasesSim } from './AcidsBasesSim';
import { AtomicStructureSim } from './AtomicStructureSim';
import { PeriodicTableSim } from './PeriodicTableSim';
import { ChemicalBondingSim } from './ChemicalBondingSim';
import { StoichiometrySim } from './StoichiometrySim';
import { GasLawsSim } from './GasLawsSim';
import { ReactionKineticsSim } from './ReactionKineticsSim';
import { ChemicalEquilibriumSim } from './ChemicalEquilibriumSim';
import { SolutionsSim } from './SolutionsSim';
import { ElectrochemistrySim } from './ElectrochemistrySim';
import { OrganicChemistrySim } from './OrganicChemistrySim';
import { ThermochemistrySim } from './ThermochemistrySim';

export interface ChemistrySimProps {
  values: Record<string, number>;
  setValue: (id: string, value: number) => void;
  resetValues: () => void;
  incrementRunCount: () => void;
  metadata: SimulationMetadata;
}

export const ChemistryRouter: React.FC<ChemistrySimProps> = (props) => {
  const { metadata } = props;
  const id = metadata.id.toLowerCase();

  // 1. Acids and Bases
  if (
    id.includes('acid') ||
    id.includes('base') ||
    id.includes('ph') ||
    id.includes('titrat') ||
    id.includes('neutral')
  ) {
    return <AcidsBasesSim {...props} />;
  }

  // 2. Atomic Structure & Bohr Model
  if (
    id.includes('atomic') ||
    id.includes('atom') ||
    id.includes('bohr') ||
    id.includes('electron') ||
    id.includes('isotope') ||
    id.includes('energy-level')
  ) {
    return <AtomicStructureSim {...props} />;
  }

  // 3. Periodic Table & Trends
  if (id.includes('periodic') || id.includes('element')) {
    return <PeriodicTableSim {...props} />;
  }

  // 4. Chemical Bonding & VSEPR
  if (
    id.includes('bond') ||
    id.includes('lewis') ||
    id.includes('geometr') ||
    id.includes('polar')
  ) {
    return <ChemicalBondingSim {...props} />;
  }

  // 5. Stoichiometry & Mole Calculations
  if (
    id.includes('mole') ||
    id.includes('stoich') ||
    id.includes('mass') ||
    id.includes('limit') ||
    id.includes('yield')
  ) {
    return <StoichiometrySim {...props} />;
  }

  // 6. Gas Laws
  if (
    id.includes('gas') ||
    id.includes('boyle') ||
    id.includes('charles') ||
    id.includes('lussac')
  ) {
    return <GasLawsSim {...props} />;
  }

  // 7. Reaction Kinetics & Catalysis
  if (
    id.includes('kinetic') ||
    id.includes('rate') ||
    id.includes('collision') ||
    id.includes('catalyst') ||
    id.includes('activation')
  ) {
    return <ReactionKineticsSim {...props} />;
  }

  // 8. Equilibrium & Le Chatelier
  if (
    id.includes('equilib') ||
    id.includes('chatelier') ||
    id.includes('haber') ||
    id.includes('quotient')
  ) {
    return <ChemicalEquilibriumSim {...props} />;
  }

  // 9. Solutions & Solubility
  if (
    id.includes('solution') ||
    id.includes('molar') ||
    id.includes('dilut') ||
    id.includes('solubil') ||
    id.includes('concentrat')
  ) {
    return <SolutionsSim {...props} />;
  }

  // 10. Electrochemistry & Redox
  if (
    id.includes('electro') ||
    id.includes('galvanic') ||
    id.includes('redox') ||
    id.includes('nernst') ||
    id.includes('cell')
  ) {
    return <ElectrochemistrySim {...props} />;
  }

  // 11. Organic Chemistry & Polymers
  if (
    id.includes('organic') ||
    id.includes('hydrocarbon') ||
    id.includes('isomer') ||
    id.includes('polymer') ||
    id.includes('functional')
  ) {
    return <OrganicChemistrySim {...props} />;
  }

  // 12. Thermochemistry & Calorimetry
  if (
    id.includes('thermo') ||
    id.includes('calor') ||
    id.includes('enthalp') ||
    id.includes('hess') ||
    id.includes('entropy') ||
    id.includes('gibbs')
  ) {
    return <ThermochemistrySim {...props} />;
  }

  // Fallback to Acid-Base simulation with live controls rather than an empty placeholder
  return <AcidsBasesSim {...props} />;
};
