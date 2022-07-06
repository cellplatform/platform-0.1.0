import * as t from '../../common/types';
export * from '../common';

/**
 * Constants
 */
export const FIELDS: t.ModuleInfoFields[] = ['Module', 'Module.Name', 'Module.Version'];
const DEFAULT_FIELDS: t.ModuleInfoFields[] = ['Module.Name', 'Module.Version'];

export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
};
