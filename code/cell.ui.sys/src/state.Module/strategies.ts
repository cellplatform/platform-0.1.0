import { t } from '../common';
import { registration } from './strategy.registration';

/**
 * Index of strategies for controlling a module.
 */
export const ModuleStrategies: t.ModuleStrategies = {
  default: registration,
  registration,
};
