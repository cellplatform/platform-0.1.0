import * as m from './types';

/**
 * Complete list of fields.
 */
const ALL_FIELDS: m.ModuleInfoFields[] = ['module', 'module.name', 'module.version'];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: m.ModuleInfoFields[] = ['module.name', 'module.version'];

export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
};

export const ModuleInfoConstants = {
  DEFAULT,
  FIELDS: ALL_FIELDS,
};
