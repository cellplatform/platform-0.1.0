import * as m from './types';

/**
 * Complete list of fields.
 */
const ALL_FIELDS: m.ModuleInfoFields[] = ['Module', 'Module.Name', 'Module.Version'];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: m.ModuleInfoFields[] = ['Module.Name', 'Module.Version'];

export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
};

export const ModuleInfoConstants = {
  DEFAULT,
  FIELDS: ALL_FIELDS,
};
