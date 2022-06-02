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
  'Deploy.Team',
  'Deploy.Project',
  'Deploy.Domain',
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
  deploy: { project: undefined, domain: undefined, response: undefined },
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
