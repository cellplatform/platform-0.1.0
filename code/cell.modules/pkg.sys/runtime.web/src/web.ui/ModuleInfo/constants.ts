import * as m from './types';

/**
 * Complete list of fields.
 */
const ALL_FIELDS: m.ModuleInfoField[] = [
  'source:url',
  'source:url:hash',
  'namespace',
  'version',
  'compiled',
  'kind',
  'hash.module:title',
  'hash.module',
  'hash.files',
  'files',
  'remote',
  'remote.exports',
];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: m.ModuleInfoField[] = [
  'source:url:hash',
  'version',
  'namespace',
  'compiled',
  'kind',
  'files',
  'remote',
  'remote.exports',
];

export const DEFAULT = {
  TITLE: 'Module',
  FIELDS: DEFAULT_FIELDS,
};

export const ModuleInfoConstants = {
  FIELDS: ALL_FIELDS,
  DEFAULT,
};
