import { t } from '../common';
import { TypeValue } from '../TypeValue';

type DefaultKind = 'VALUE' | 'REF' | 'UNKNOWN';

/**
 * Parser for interpreting default values for a type.
 */
export class TypeDefault {
  /**
   * Derive what kind of "default value" definition is given.
   */
  public static kind(input: any): DefaultKind {
    if (typeof input !== 'object' || input === null) {
      return 'UNKNOWN';
    }

    if (Object.keys(input).includes('value') && TypeValue.isPrimitive(input.value)) {
      return 'VALUE';
    }

    if (typeof input.ref === 'string') {
      return 'REF';
    }

    return 'UNKNOWN';
  }

  /**
   * Wrangled input into a "default value" definition.
   */
  public static toTypeDefault(input: t.ITypeDef | t.ITypeDefault): t.ITypeDefault | undefined {
    const def = input as any;
    if (typeof def !== 'object' || def === null) {
      throw new Error(`Input object required.`);
    }

    if (typeof def.prop === 'string' && typeof def.type === 'object') {
      const value = (def as t.ITypeDef).default;
      return value === undefined ? undefined : typeof value === 'object' ? value : { value };
    }

    const kind = TypeDefault.kind(def);
    if (kind === 'VALUE' || kind === 'REF') {
      return def as t.ITypeDefault;
    }

    throw new Error(`A default definition could not be derived.`);
  }

  /**
   * Derives the default value for the given input.
   */
  public static async toValue(args: { def: t.ITypeDef | t.ITypeDefault; client?: t.IHttpClient }) {
    const def = TypeDefault.toTypeDefault(args.def);
    if (!def) {
      return undefined;
    }

    const kind = TypeDefault.kind(def);

    if (kind === 'VALUE') {
      return (def as t.ITypeDefaultValue).value;
    }

    if (kind === 'REF') {
      const { client } = args;
      const ref = (def as t.ITypeDefaultRef).ref;
      if (!client) {
        const err = `An HTTP client was not provided to lookup the default value reference at '${ref}'.`;
        throw new Error(err);
      }
    }
    //

    return;
  }
}

/**
 * [Helpers]
 */
