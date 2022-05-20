import { t } from '../common';

export * from '../common';
export { Filesystem } from '../../FsBus.IndexedDb';

export const THEMES: t.FsCardTheme[] = ['Light', 'Dark'];

const THEME: t.FsCardTheme = 'Light';
export const DEFAULT = { THEME };
