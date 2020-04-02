import * as t from './types';
import { Uri } from '../../common';

export type IRefsArgs = {
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  ns: string | t.INsUri;
  data: t.ICellData;
  ctx: t.SheetCtx;
};

/**
 * A connector for a reference-pointer to a set of rows in another sheet.
 */
export class TypedSheetRefs<T> implements t.ITypedSheetRef<T> {
  public static create<T>(args: IRefsArgs) {
    return new TypedSheetRefs<T>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IRefsArgs) {
    this.ns = typeof args.ns === 'string' ? Uri.parse<t.INsUri>(args.ns).parts : args.ns;
    this.typeDef = args.typeDef;
    this.cell = args.data;
    this.ctx = args.ctx;

    if (this.ns.type !== 'NS') {
      throw new Error(`Not a namespace URI (${this.ns.toString()})`);
    }



    console.log('-------------------------------------------');
    console.log('args.typeDef', args.typeDef);
    console.log('this.ns', this.ns);
    console.log('this.cell', this.cell);
    console.log('-------------------------------------------');
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  private cell: t.ICellData;

  public readonly typeDef: t.IColumnTypeDef<t.ITypeRef>;
  public readonly ns: t.INsUri;
}
