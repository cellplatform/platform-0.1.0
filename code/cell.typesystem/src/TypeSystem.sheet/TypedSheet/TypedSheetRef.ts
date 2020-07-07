import { t } from './common';

export type IArgs = {
  typename: string;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  ctx: t.SheetCtx;
};

/**
 * A connector for a reference-pointer to a single row in another sheet.
 *
 * Generic (see [TypedSheet] for more):
 *    <T> = TypeIndex = { [TypeName]:Type }
 *
 * 🐷 NOT IMPLEMENTED YET
 *    -------------------
 *    Initial implementation within [TypedSheetRefs] plural/list.
 *    The way to handle this implementation will become apparent
 *    after some initial uses of [TypedSheetRefs].
 *
 */
export class TypedSheetRef<T, K extends keyof T> implements t.ITypedSheetRef<T, K> {
  public static create<T, K extends keyof T>(args: IArgs) {
    return new TypedSheetRef<T, K>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this._ctx = args.ctx;
    this.typeDef = args.typeDef;
    this.typename = args.typename;
  }

  /**
   * [Fields]
   */
  private readonly _ctx: t.SheetCtx;
  public readonly typeDef: t.IColumnTypeDef<t.ITypeRef>;
  public readonly typename: string;
}
