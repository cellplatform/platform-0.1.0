import { t, Uri } from '../../common';
import { TypeValue } from '../TypeValue';

type IKind = IKindValue | IKindRef | IKindUnknown;
type IKindValue = { type: 'VALUE'; isArray: boolean };
type IKindRef = { type: 'REF' };
type IKindUnknown = { type: 'UNKNOWN' };

type IToValueResult = IToValueResultSimple | IToValueResultRef | IToValueResultUnknown;
type IToValueResultSimple = { kind: 'VALUE'; value: t.ITypeDefaultValue['value'] };
type IToValueResultRef = { kind: 'REF'; value: t.Json };
type IToValueResultUnknown = { kind: 'UNKNOWN'; value: undefined };

/**
 * Parser for interpreting default values for a type.
 */
export class TypeDefault {
  /**
   * Derive what kind of "default value" definition is given.
   */
  public static kind(input: any | t.ITypeDef | t.ITypeDefault): IKind {
    if (typeof input !== 'object' || input === null) {
      return { type: 'UNKNOWN' };
    }

    if (Object.keys(input).includes('value')) {
      const value = input.value;
      const isValue = (value: any) => TypeValue.isPrimitive(value) || typeof value === 'object';
      if (Array.isArray(value) && value.every(item => isValue(item))) {
        return { type: 'VALUE', isArray: true };
      } else if (isValue(value)) {
        return { type: 'VALUE', isArray: false };
      }
    }

    if (typeof input.ref === 'string') {
      return { type: 'REF' };
    }

    return { type: 'UNKNOWN' };
  }

  /**
   * Determine if the given value is an [ITypeDef]
   */
  public static isTypeDef(input: any) {
    const def = typeof input === 'object' ? input : {};
    return typeof def.prop === 'string' && typeof def.type === 'object';
  }

  /**
   * Determine if the given value is an [ITypeDefault]
   */
  public static isTypeDefault(input: any) {
    const def = typeof input === 'object' ? input : {};
    const kind = TypeDefault.kind(def);
    return kind.type === 'VALUE' || kind.type === 'REF';
  }

  /**
   * Wrangled input into a "default value" definition.
   */
  public static toTypeDefault(input: t.ITypeDef | t.ITypeDefault): t.ITypeDefault | undefined {
    const def = input as any;
    if (typeof def !== 'object' || def === null) {
      throw new Error(`Input object required.`);
    }

    if (TypeDefault.isTypeDef(def)) {
      const value = (def as t.ITypeDef).default;
      if (value === undefined) {
        return undefined;
      } else {
        return typeof value === 'object' && value !== null ? value : { value };
      }
    }

    if (TypeDefault.isTypeDefault(def)) {
      return def as t.ITypeDefault;
    }

    // No match.
    throw new Error(`A default definition could not be derived.`);
  }

  /**
   * Derives the default-value for the given input.
   */
  public static async toValue(args: {
    def: t.ITypeDef | t.ITypeDefault;
    fetch?: t.ISheetFetcher;
  }): Promise<IToValueResult> {
    const def = TypeDefault.toTypeDefault(args.def);
    if (!def) {
      return { kind: 'UNKNOWN', value: undefined };
    }

    const kind = TypeDefault.kind(def);
    if (kind.type === 'VALUE') {
      const value = (def as t.ITypeDefaultValue).value;
      return { kind: 'VALUE', value };
    }

    if (kind.type === 'REF') {
      const def = args.def as t.ITypeDefaultRef;
      const fetch = args.fetch;
      if (!fetch) {
        const err = `An HTTP fetch client was not provided to lookup the default-value reference at '${def.ref}'.`;
        throw new Error(err);
      }
      return TypeDefault.toRefValue({ def, fetch });
    }

    throw new Error(`[${kind.type}] not supported.`);
  }

  /**
   * Looks up the default-value at a referenced end-point.
   */
  public static async toRefValue(args: {
    def: t.ITypeDefaultRef;
    fetch: t.ISheetFetcher;
  }): Promise<IToValueResultRef> {
    const { def, fetch } = args;
    const { path } = def;

    const uri = Uri.parse(def.ref);
    if (uri.error || uri.type !== 'CELL') {
      const err = `A default-value reference URI must point to a cell (${def.ref})`;
      throw new Error(err);
    }

    if (uri.type === 'CELL') {
      const { ns, key } = uri.parts as t.ICellUri;
      const query = `${key}:${key}`;
      const res = await fetch.getCells({ ns, query });
      if (res.error) {
        const err = `Failed to fetch default value from [${uri.uri}]. ${res.error.message}`;
        throw new Error(err);
      }

      const cell = (res.cells || {})[key];
      if (cell === undefined) {
        return { kind: 'REF', value: undefined };
      }
      const props = cell.props || {};

      if (path === undefined) {
        // NB:  When no 'path' is specified assume the "value" field
        //      cascading through {props.value} => {value}.
        const value = props.value !== undefined ? props.value : cell.value;
        return { kind: 'REF', value };
      }
      if (path === 'value') {
        // Explicit {value} requested (ignore {props.value}).
        const value = cell.value;
        return { kind: 'REF', value };
      }

      const PROPS = 'props:';
      if (path.startsWith(PROPS)) {
        const field = path.substring(PROPS.length);
        const value = (cell.props || {})[field];
        return { kind: 'REF', value };
      }
    }

    // No match
    return { kind: 'REF', value: undefined };
  }
}
