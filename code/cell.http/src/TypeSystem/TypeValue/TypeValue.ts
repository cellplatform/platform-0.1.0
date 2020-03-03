import { t, Schema } from '../common';
import { tokenize } from './tokenize';

/**
 * Parser for interpreting a type value.
 */
export class TypeValue {
  public static token = tokenize;

  /**
   * Determine if the given value is a reference to another type.
   */
  public static isRef(input?: string) {
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
  public static isArray(input?: string) {
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
   * Determines if the given input represents a group.
   * eg:
   *    - (string)
   *    - (string | boolean)
   *    - (string | ns:foo)[]
   */
  public static isGroup(input?: string) {
    if (typeof input !== 'string') {
      return false;
    } else {
      const value = input.trim();
      return value.startsWith('(') && (value.endsWith(')') || value.endsWith(')[]'));
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

    type U = t.ITypeUnion;
    let result: t.IType | undefined;
    let next = value;

    const tokenToType = (token: t.ITypeToken) => {
      if (token.kind === 'VALUE') {
        return TypeValue.toType(token.text);
      }
      if (token.kind === 'GROUP' || token.kind === 'GROUP[]') {
        return TypeValue.parse(token.text); // <== RECURSION 🌳
      }

      const unknown: t.ITypeUnknown = { kind: 'UNKNOWN', typename: token.input };
      return unknown;
    };

    do {
      const token = tokenize.next(next);
      next = token.next;

      if (next) {
        // UNION of several types.
        if (!result) {
          const union: U = { kind: 'UNION', typename: token.input, types: [] };
          result = union;
        }
        (result as U).types.push(tokenToType(token));
      } else {
        // LAST type (or ONLY type).
        if (result?.kind === 'UNION') {
          (result as U).types.push(tokenToType(token));
        } else {
          result = tokenToType(token);
        }
      }
    } while (next);

    // Collapse all enumerations into a single enumeration collection.
    if (result.kind === 'UNION' && result.types.some(type => type.kind === 'ENUM')) {
      const values = result.types.reduce((acc, next) => {
        if (next.kind === 'ENUM') {
          next.values.forEach(value => acc.push(value));
        }
        return acc;
      }, [] as string[]);

      const enums: t.ITypeEnum = {
        kind: 'ENUM',
        typename: values.map(value => `'${value}'`).join(' | '),
        values,
      };

      result = {
        ...result,
        types: [...result.types.filter(type => type.kind !== 'ENUM'), enums],
      };
    }

    // If UNION only has one type within it, elevate that type to be the root type.
    if (result.kind === 'UNION' && result.types.length === 1) {
      result = result.types[0];
    }

    // Clean up UNION typename.
    if (result.kind === 'UNION') {
      result = {
        ...result,
        typename: result.types
          .map(type => (type.kind === 'UNION' ? `(${type.typename})` : type.typename))
          .join(' | '),
      };
    }

    // Finish up.
    return result || unknown;
  }

  /**
   * Parses a single input 'type' value into an [IType] object.
   */
  public static toType(input?: string): t.IType {
    // Setup initial conditions.
    const value = (typeof input === 'string' ? input : '').trim();
    const isArray = TypeValue.isArray(value);

    const unknown: t.ITypeUnknown = { kind: 'UNKNOWN', typename: value };
    if (typeof input !== 'string' || !value) {
      return unknown;
    }

    // Parse out VALUE types.
    const TYPES = ['string', 'number', 'boolean', 'null', 'undefined'];
    for (const type of TYPES) {
      const match = isArray ? value.replace(/\[\]$/, '') : value;
      if (type === match) {
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
      const uri = value;
      const is = Schema.uri.is;
      const scope: t.ITypeRef['scope'] = is.ns(uri) ? 'NS' : is.column(uri) ? 'COLUMN' : 'UNKNOWN';
      const type: t.ITypeRef = { kind: 'REF', uri, scope, typename: '', types: [] };
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
