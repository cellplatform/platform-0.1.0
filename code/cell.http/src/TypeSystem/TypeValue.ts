import { t, Schema } from './common';

/**
 * Parser for interpreting a type value.
 */
export class TypeValue {
  /**
   * Determine if the given value is a reference to another type.
   */
  public static isRef(input?: string | object) {
    if (typeof input !== 'string') {
      return false;
    } else {
      const is = Schema.uri.is;
      return is.ns(input) || is.column(input);
    }
  }

  /**
   * Determines if the given input represents an array of types.
   * eg:
   *    - string[]
   *    - ns:foo[]
   *    - (string | ns:foo)[]
   */
  public static isArray(input?: string | object) {
    if (typeof input !== 'string') {
      return false;
    } else {
      const value = input.trim();
      if (value.startsWith('(')) {
        const isMatch = Boolean(value.match(/^\((.+)\)\[\]$/));
        return isMatch && value.replace(/\s/g, '') !== '()[]';
      } else {
        return Boolean(value.match(/[\w\d]\[\]$/));
      }
    }
  }

  /**
   * Parses an input 'type' declared on a column into a [Type] object.
   */
  public static parse(input?: string): t.IType {
    // Setup initial conditions.
    const value = (typeof input === 'string' ? input : '').trim();

    const unknown: t.ITypeUnknown = { kind: 'UNKNOWN', typename: value };
    if (typeof input !== 'string' || !value) {
      return unknown;
    }

    // Determine if the input is an array of types.
    if (value.startsWith('(') && TypeValue.isArray(value)) {
      // TODO
      console.log('TODO: array -------------------------------------------');
    }

    // Parse out VALUE types.
    const TYPES = ['string', 'number', 'boolean', 'null', 'undefined'];
    for (const type of TYPES) {
      if (value === type) {
        const typename = value as t.ITypeValue['typename'];
        const type: t.ITypeValue = { kind: 'VALUE', typename };
        return type;
      }
    }

    // Parse out REF types.
    if (TypeValue.isRef(value)) {
      // NOTE:  The type-ref is a stub, and will require doing a lookup
      //        with an HTTP client to resolve the final typename/types
      //        defined in the remote "ns".
      const type: t.ITypeRef = { kind: 'REF', uri: value, typename: '', types: [] };
      return type;
    }

    // Parse out ENUM types.
    if (value.includes(`'`) || value.includes(`"`)) {
      const values = value.split('|').map(part =>
        part
          .trim()
          .replace(/^["']/, '')
          .replace(/["']$/, '')
          .trim(),
      );
      const typename = values.map(part => `'${part}'`).join(' | ');
      const type: t.ITypeEnum = { kind: 'ENUM', typename, values };
      return type;
    }

    // No match.
    return unknown;
  }
}
