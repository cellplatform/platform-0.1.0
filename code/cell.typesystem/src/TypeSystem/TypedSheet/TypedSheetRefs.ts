import * as t from './types';

export type ITypedSheetRefArg = {
  ctx: t.SheetCtx;
};

/**
 * A connector for a reference-pointer to a set of rows in another sheet.
 */
export class TypedSheetRefs<T> implements t.ITypedSheetRef<T> {
  public static create<T>(args: ITypedSheetRefArg) {
    return new TypedSheetRefs<T>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: ITypedSheetRefArg) {
    this.ctx = args.ctx;
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
}
