import * as m from './types';

/**
 * Complete list of fields.
 */
const ALL_FIELDS: m.ModuleInfoFields[] = [
  'Module',
  'Module.Name',
  'Module.Version',
  'Token.API',
  'Token.API.Hidden',
];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: m.ModuleInfoFields[] = ['Module.Name', 'Module.Version'];

/**
 * Default configuration settings.
 */
const DEFAULT_CONFIG: m.ModuleInfoConfig = {
  token: undefined,
};

/**
 * EXPORT
 */
export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
  CONFIG: DEFAULT_CONFIG,
};

export const ModuleInfoConstants = {
  DEFAULT,
  FIELDS: ALL_FIELDS,
};
