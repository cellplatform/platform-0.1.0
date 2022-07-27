import { t } from '../common';

export * from '../common';
export { Filesystem as IndexedDb } from '../../FsBus.IndexedDb';

/**
 * Constants
 */
export const THEMES: t.FsPathListTheme[] = ['Light', 'Dark'];
export const DEFAULT = {
  THEME: <t.FsPathListTheme>'Light',
};
