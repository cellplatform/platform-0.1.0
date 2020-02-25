import { t, value } from './common';

type ITypedRowData = {
  type: t.ITypeDef;
  data: t.ICellData;
};

type ITypedSheetRowArgs = {
  index: number;
  uri: string;
  columns: ITypedRowData[];
  events$: t.Subject<t.TypedSheetEvent>;
};

/**
 * A strongly-typed row.
 */
export class TypedSheetRow<T> implements t.ITypedSheetRow<T> {
  public static create = <T>(args: ITypedSheetRowArgs) =>
    new TypedSheetRow<T>(args) as t.ITypedSheetRow<T>;

  /**
   * [Lifecycle]
   */
  private constructor(args: ITypedSheetRowArgs) {
    this.index = args.index;
    this.uri = args.uri;
    this._columns = args.columns;
    this._events$ = args.events$;
  }

  /**
   * [Fields]
   */
  private readonly _events$: t.Subject<t.TypedSheetEvent>;
  private readonly _columns: ITypedRowData[] = [];
  private _props: T;

  public readonly index: number;
  public readonly uri: string;

  /**
   * [Properties]
   */
  public get types() {
    return this._columns.map(({ type }) => type);
  }

  public get props(): T {
    if (!this._props) {
      const res = {} as any;
      this._columns.forEach(column => {
        Object.defineProperty(res, column.type.prop, {
          get: () => this.readProp(column),
          set: value => this.writeProp(column, value),
        });
      });
      this._props = res;
    }
    return this._props;
  }

  /**
   * [Internal]
   */

  private readProp(column: ITypedRowData) {
    // console.log(this.index, 'READ', column.type.column, column.type.prop);
    const { type, data } = column;
    const { prop, target } = type;
    // const target = type.
    // const target = columns.ty
    // console.log('prop', prop, target);
    // return column.data.

    if (target === undefined) {
      return data.value;
    } else if (target.startsWith('inline:')) {
      const field = target.substring('inline:'.length);

      // TODO 🐷 field dot (deep) support.
      console.group('🌳 ');
      console.log('field', field);
      console.log('data.props', data.props);

      console.groupEnd();

      return value.object.pluck(field, data.props || {});

      // console.log('field', field);
      // return (data.props || {})[field];
    } else {
      return; // TEMP 🐷
    }

    // data.
  }

  private writeProp(column: ITypedRowData, value: any) {
    console.log(this.index, 'WRITE', column.type.column, column.type.prop, value);
  }
}

// function getFiel() {

// }
