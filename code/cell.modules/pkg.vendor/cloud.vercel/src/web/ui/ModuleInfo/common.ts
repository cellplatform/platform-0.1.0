import * as t from '../../common/types';
export * from '../common';

/**
 * Constants
 */
export const FIELDS: t.ModuleInfoFields[] = [
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
 * Default configuration settings.
 */
export const DEFAULT = {
  fields: <t.ModuleInfoFields[]>['Module.Name', 'Module.Version'],
  data: <t.ModuleInfoData>{
    token: undefined,
    deploy: { project: undefined, domain: undefined, response: undefined },
  },
};
