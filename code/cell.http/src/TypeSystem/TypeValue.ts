import { t } from './common';


/**
 * Parser for interpreting a type value.
 */
export class TypeValue {
  /**
   * Determine if the given value is a reference to another type.
   */
  public static isRef(input?: string | object) {
    return typeof input !== 'string' ? false : input.trimLeft().startsWith('=');
  }
}
