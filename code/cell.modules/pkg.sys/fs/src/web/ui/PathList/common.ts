import { t } from '../common';

export * from '../common';
export { Filesystem } from '../../FsBus.IndexedDb';

export const THEMES: t.PathListTheme[] = ['Light', 'Dark'];

const THEME: t.PathListTheme = 'Light';
export const DEFAULT = { THEME };
