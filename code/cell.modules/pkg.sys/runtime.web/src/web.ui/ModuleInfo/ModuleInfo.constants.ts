import * as m from './types';

const FIELDS: m.ModuleInfoFields[] = [
  'url',
  'namespace',
  'version',
  'compiled',
  'hash',
  'hash.module',
  'hash.files',
  'kind',
  'files',
  'remote',
  'remote.exports',
];

export const ModuleInfoDefaults = {
  FIELDS,
};
