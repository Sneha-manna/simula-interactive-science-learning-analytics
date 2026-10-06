import { SimulationMetadata } from '../../types/simulation';
import { CHEMISTRY_REGISTRY_PART_1 } from './chemistryRegistry1';
import { CHEMISTRY_REGISTRY_PART_2 } from './chemistryRegistry2';

export const CHEMISTRY_SIMULATIONS: SimulationMetadata[] = [
  ...CHEMISTRY_REGISTRY_PART_1,
  ...CHEMISTRY_REGISTRY_PART_2,
];
