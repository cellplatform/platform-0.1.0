import * as t from './types';

export type ITypedSheetRefArgs = {
  ctx: t.SheetCtx;
};

/**
 * A connector for a reference-pointer to a single row in another sheet.
 */
export class TypedSheetRef<T> implements t.ITypedSheetRef<T> {
  public static create<T>(args: ITypedSheetRefArgs) {
    return new TypedSheetRef<T>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: ITypedSheetRefArgs) {
    //
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
}
