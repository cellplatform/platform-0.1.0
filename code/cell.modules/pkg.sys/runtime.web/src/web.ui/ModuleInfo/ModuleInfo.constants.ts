import * as m from './types';

const FIELDS: m.ModuleInfoFields[] = [
  'namespace',
  'version',
  'compiled',
  'kind',
  'files',
  'remote',
  'remote.exports',
];

export const ModuleInfoDefaults = {
  FIELDS,
};
