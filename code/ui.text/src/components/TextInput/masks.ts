// import { value } from '../../common';
import { TextInputMask } from './types';
import { value } from '@platform/util.value';

/**
 * Ensure entered text is only a number.
 */
export const isNumeric = (e: TextInputMask): boolean => {
  return value.isNumeric(e.char);
};
