import * as t from '../../common/types';

/**
 * [CONSTANTS]
 */
export const MONOSPACE = { FAMILY: 'monospace' };
export const SANS = { FAMILY: 'sans-serif' };
export const SYSTEM_FONT = {
  WEIGHTS: { THIN: 100, LIGHT: 300, NORMAL: 400, BOLD: 900 },
  MONOSPACE,
  SANS,
};

/**
 * [Defaults]
 */

export const TEXT_STYLE: t.TextInputStyle = {
  opacity: 1,
  color: -1,
  disabledColor: -1,
  italic: false,
  fontSize: undefined,
  fontWeight: undefined,
  fontFamily: undefined,
  letterSpacing: undefined,
  lineHeight: undefined,
};

export const DEFAULT = {
  TEXT: { STYLE: TEXT_STYLE },
  DISABLED_OPACITY: 0.2,
};
