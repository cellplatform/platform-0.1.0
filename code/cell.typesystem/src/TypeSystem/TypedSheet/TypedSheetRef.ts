import * as t from './types';

export type ITypedSheetRefArgs = {
  ctx: t.SheetCtx;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
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
    this.ctx = args.ctx;
    this.typeDef = args.typeDef;
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  public readonly typeDef: t.IColumnTypeDef<t.ITypeRef>;
}
