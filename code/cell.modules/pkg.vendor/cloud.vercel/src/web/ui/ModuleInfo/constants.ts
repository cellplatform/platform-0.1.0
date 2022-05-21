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
  'Deploy.Response',
];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: m.ModuleInfoFields[] = ['Module.Name', 'Module.Version'];

/**
 * Default configuration settings.
 */
const DEFAULT_DATA: m.ModuleInfoData = {
  token: undefined,
  deploymentResponse: undefined,
};

/**
 * EXPORT
 */
export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
  DATA: DEFAULT_DATA,
};

export const ModuleInfoConstants = {
  DEFAULT,
  FIELDS: ALL_FIELDS,
};
