import * as m from './types';

/**
 * Complete list of fields.
 */
const ALL_FIELDS: m.ModuleInfoFields[] = [
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
const DEFAULT_FIELDS: m.ModuleInfoFields[] = [
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
  HASH_CHIP_LENGTH: 5,
};

export const ModuleInfoConstants = {
  DEFAULT,
  FIELDS: ALL_FIELDS,
};
