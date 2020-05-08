import { t, Uri } from '../common';
import { TypeBuilderType } from './TypeBuilderType';

export type IArgs = {
  uri: string | t.INsUri;
};

/**
 * A structured API for building a type-definitions of a single namespace.
 */
export class TypeBuilderNs implements t.ITypeBuilderNs {
  public static create = (args: IArgs) => new TypeBuilderNs(args) as t.ITypeBuilderNs;

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this.uri = Uri.ns(args.uri);
  }

  /**
   * [Fields]
   */
  public readonly uri: t.INsUri;
  public readonly types: t.ITypeBuilderType[] = [];

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }

  public type(typename: string, options: { startColumn?: string | number } = {}) {
    const { startColumn } = options;
    const uri = this.uri;

    typename = (typename || '').trim();
    const exists = this.types.some(item => item.typename === typename);
    if (exists) {
      const err = `The typename '${typename}' already exists`;
      throw new Error(err);
    }

    const type = TypeBuilderType.create({ uri, typename, startColumn });
    this.types.push(type);
    return type;
  }
}
