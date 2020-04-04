import * as t from './types';

export type IArgs = {
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  ctx: t.SheetCtx;
};

/**
 * A connector for a reference-pointer to a single row in another sheet.
 */
export class TypedSheetRef<T> implements t.ITypedSheetRef<T> {
  public static create<T>(args: IArgs) {
    return new TypedSheetRef<T>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this.ctx = args.ctx;
    this.typeDef = args.typeDef;
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  public readonly typeDef: t.IColumnTypeDef<t.ITypeRef>;
}
