import { t, Uri, coord, defaultValue } from '../common';
import { TypeScript } from '../TypeSystem.core';

export type IArgs = {
  uri: string | t.INsUri;
  typename: string;
  startColumn?: string | number;
};

/**
 * A structured API for building a type-definitions of a single namespace.
 */
export class TypeBuilderType implements t.ITypeBuilderType {
  public static create = (args: IArgs) => new TypeBuilderType(args) as t.ITypeBuilderType;

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    const validation = TypeScript.validate.objectTypename(args.typename);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    let startColumn = defaultValue(args.startColumn, 0);
    if (typeof startColumn === 'string') {
      if (!coord.cell.isColumn(startColumn)) {
        throw new Error(`The given start-column key (${startColumn}) is not a valid column`);
      }
      startColumn = coord.cell.toAxisIndex('COLUMN', startColumn);
    }
    if (typeof startColumn === 'number' && startColumn < 0) {
      throw new Error(`The given start-column index (${startColumn}) is less than zero`);
    }

    this.uri = Uri.ns(args.uri);
    this.typename = (args.typename || '').trim();
    this.startColumn = startColumn as number;
  }

  /**
   * [Fields]
   */
  public readonly uri: t.INsUri;
  public readonly typename: string;
  public readonly startColumn: number;

  /**
   * [Methods]
   */
  public toObject() {
    return { columns: {} };
  }
}
