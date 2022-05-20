import { t } from '../common';

export * from '../common';
export { Filesystem as IndexedDb } from '../../FsBus.IndexedDb';

/**
 * Constants
 */
export const THEMES: t.PathListTheme[] = ['Light', 'Dark'];

const THEME: t.PathListTheme = 'Light';
export const DEFAULT = { THEME };
