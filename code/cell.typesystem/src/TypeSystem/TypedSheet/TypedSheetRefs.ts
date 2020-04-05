import { t, Uri, util } from './common';

export type IArgs = {
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  ns: string | t.INsUri;
  ctx: t.SheetCtx;
};

/**
 * A connector for a reference-pointer to a set of rows in another sheet.
 */
export class TypedSheetRefs<T> implements t.ITypedSheetRef<T> {
  public static create<T>(args: IArgs) {
    return new TypedSheetRefs<T>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this.typeDef = args.typeDef;
    this.ns = util.formatNsUri(args.ns);
    this.ctx = args.ctx;

    // console.log('-------------------------------------------');
    // console.log('args.typeDef', args.typeDef);
    // console.log('this.ns', this.ns);
    // console.log('-------------------------------------------');
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  public readonly typeDef: t.IColumnTypeDef<t.ITypeRef>;
  public readonly ns: t.INsUri;
}
