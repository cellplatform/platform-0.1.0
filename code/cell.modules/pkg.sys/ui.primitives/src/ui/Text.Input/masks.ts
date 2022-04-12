import { ITextInputMask } from './types';
import { value } from '@platform/util.value';

/**
 * Ensure entered text is only a number.
 */
export const isNumeric = (e: ITextInputMask): boolean => {
  return value.isNumeric(e.char);
};
