import { t, Uri } from '../common';

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

  /**
   * [Methods]
   */
  public toObject() {
    return { columns: {} };
  }
}
