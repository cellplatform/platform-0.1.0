import * as t from '../../common/types';

export * from '../common';

/**
 * Complete list of fields.
 */
export const FIELDS: t.ModuleInfoFields[] = [
  'Module',
  'Module.Name',
  'Module.Version',
  'DataStructure',
];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: t.ModuleInfoFields[] = ['Module', 'Module.Version'];

export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
};
