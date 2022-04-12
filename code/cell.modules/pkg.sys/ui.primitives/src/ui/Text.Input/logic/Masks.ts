import { value, t } from '../common';

export const TextInputMasks = {
  /**
   * Ensure entered text is only a number.
   */
  isNumeric(e: t.ITextInputMask) {
    return value.isNumeric(e.char);
  },
};
