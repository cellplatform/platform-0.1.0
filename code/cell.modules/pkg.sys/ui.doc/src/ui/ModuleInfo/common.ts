import * as t from '../../types';
export * from '../common';

/**
 * Constants
 */
export const FIELDS: t.ModuleInfoFields[] = ['Module', 'Module.Name', 'Module.Version'];

export const DEFAULT = {
  fields: <t.ModuleInfoFields[]>['Module.Name', 'Module.Version'],
};
