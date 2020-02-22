/**
 * TODO 🐷
 * - move to [cell.schema]
 */

 import { t } from '../common';

// t.cli

export type ITypeNsArgs = {};

/**
 * The type-system for a namespace.
 */
export class TypeNs {
  public static create = (args: ITypeNsArgs) => new TypeNs(args);
  //

  /**
   * [Lifecycle]
   */
  private constructor(args: ITypeNsArgs) {
    //
    console.log('args', args);
  }
}

/**
 * Represents a namespace as a logical sheet of cells.
 */
export class SheetClient {}
