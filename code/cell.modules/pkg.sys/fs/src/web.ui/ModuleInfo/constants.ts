import * as k from './types';

/**
 * Complete list of fields.
 */
const ALL_FIELDS: k.ModuleInfoFields[] = ['module', 'module.name', 'module.version'];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: k.ModuleInfoFields[] = ['module.name', 'module.version'];

export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
};

export const ModuleInfoConstants = {
  DEFAULT,
  FIELDS: ALL_FIELDS,
};
