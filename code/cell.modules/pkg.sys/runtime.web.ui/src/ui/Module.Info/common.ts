import * as t from '../../common/types';
export * from '../common';
export { Icons } from '../Icons';

/**
 * Complete list of fields.
 */
export const FIELDS: t.ModuleInfoFields[] = [
  'source:url',
  'source:url:hash',
  'source:url:entry',
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
const DEFAULT_FIELDS: t.ModuleInfoFields[] = [
  'source:url:hash',
  'version',
  'namespace',
  'compiled',
  'kind',
  'files',
  'remote',
  'remote.exports',
];

export const THEMES: t.ModuleInfoTheme[] = ['Light', 'Dark'];

export const DEFAULT = {
  TITLE: 'Module',
  FIELDS: DEFAULT_FIELDS,
  HASH_CHIP_LENGTH: 5,
  THEMES,
  THEME: THEMES[0],
};
