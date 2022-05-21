import { t } from '../common';

export * from '../common';
export { Filesystem as IndexedDb } from '../../FsBus.IndexedDb';

/**
 * Constants
 */
export const THEMES: t.FsPathListTheme[] = ['Light', 'Dark'];

const THEME: t.FsPathListTheme = 'Light';
export const DEFAULT = { THEME };
