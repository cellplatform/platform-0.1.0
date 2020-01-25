import { ICssStyle } from './types';

export { CssValue, CssProps } from './types';
export { css } from './css';
export { color } from './color';

/**
 * Primary {style} API.
 */
import * as api from './style';
export const style = api as ICssStyle;
