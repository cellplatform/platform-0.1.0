import { value, t } from './common';

/**
 * Ensure entered text is only a number.
 */
export function isNumeric(e: t.ITextInputMask) {
  return value.isNumeric(e.char);
}
