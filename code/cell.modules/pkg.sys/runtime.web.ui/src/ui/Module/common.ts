import * as t from '../../common/types';

export * from '../common';
export { useModule } from '../useModule';
export { ModuleInfo } from '../Module.Info';

/**
 * Constants.
 */
export const THEMES: t.ModuleTheme[] = ['Light', 'Dark'];
export const DEFAULT = {
  THEMES,
  THEME: THEMES[0],
};
