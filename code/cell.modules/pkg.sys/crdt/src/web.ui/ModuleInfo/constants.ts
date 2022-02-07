import * as k from './types';

/**
 * Complete list of fields.
 */
const ALL_FIELDS: k.ModuleInfoFields[] = ['Module', 'Module.Name', 'Module.Version', 'DataFormat'];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: k.ModuleInfoFields[] = ['Module', 'Module.Version'];

export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
};

export const ModuleInfoConstants = {
  DEFAULT,
  FIELDS: ALL_FIELDS,
};
