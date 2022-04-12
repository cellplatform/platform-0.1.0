import { toTextCss } from '../../common';
import { TextInputStyle } from './types';
import { color } from '@platform/css';

/**
 * Converts a set of Input styles into CSS.
 */
export const toTextInputCss = (isEnabled: boolean, styles: TextInputStyle) => {
  return {
    ...toTextCss(styles),
    color: isEnabled ? color.format(styles.color) : color.format(styles.disabledColor),
  };
};
