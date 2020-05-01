import { t } from '../common';
import { TypeBuilderNs } from './TypeBuilderNs';

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
  public get defs() {
    return this._ns.reduce((acc: t.ITypeBuilderDefs, next) => {
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
    const ns = TypeBuilderNs.create({ uri });
    this._ns.push(ns);
    return ns;
  }
}
