import { Uri, t } from '../common';

type TypeDefs = { [key: string]: t.ITypeDefPayload };

/**
 * A structured API for building a set of type-definitions in code.
 */
export class TypeBuilder implements t.ITypeBuilder {
  public static create = () => new TypeBuilder() as t.ITypeBuilder;

  /**
   * [Lifecycle]
   */
  private constructor() {}

  /**
   * [Fields]
   */
  private _ns: t.ITypeBuilderNs[] = [];

  /**
   * [Properties]
   */
  public get defs(): TypeDefs {
    return this._ns.reduce((acc: TypeDefs, next) => {
      const ns = next.uri.toString();
      acc[ns] = next.toObject();
      return acc;
    }, {});
  }

  /**
   * [Methods]
   */
  public toObject() {
    return this.defs;
  }

  public ns(uri: string | t.INsUri) {
    const api: t.ITypeBuilderNs = {
      uri: Uri.ns(uri),
      toObject() {
        return { columns: {} };
      },
    };
    this._ns.push(api);
    return api;
  }
}
