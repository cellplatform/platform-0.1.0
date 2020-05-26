import { toTextCss } from '../../common';
import { ITextInputStyle } from './types';
import { color } from '@platform/css';

/**
 * Converts a set of Input styles into CSS.
 */
export const toTextInputCss = (isEnabled: boolean, styles: ITextInputStyle) => {
  return {
    ...toTextCss(styles),
    color: isEnabled ? color.format(styles.color) : color.format(styles.disabledColor),
  };
};
