import { t } from '../../common';
export * from '../../common';

/**
 * Constants
 */
const THEMES: t.PropListTheme[] = ['Light', 'Dark'];
const THEME: t.PropListTheme = 'Light';
export const DEFAULT = { THEME };
export const constants = { DEFAULT, THEMES };
