import { value } from '../../../common';
import { ITextInputMask } from '../types';

export { ITextInputMask };

/**
 * Ensure entered text is only a number.
 */
export const isNumeric = (e: ITextInputMask): boolean => {
  return value.isNumeric(e.char);
};
