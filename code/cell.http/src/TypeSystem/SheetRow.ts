import * as t from './_types';
import { Schema, value } from './common';

type IRowTypeData = {
  type: t.ITypeDef;
  data: t.ICellData;
};

type ISheetRowArgs = {
  index: number;
  uri: string;
  columns: IRowTypeData[];
};

/**
 * A strongly-typed row.
 */
export class SheetRow<T> implements t.ISheetRow<T> {
  public static create = <T>(args: ISheetRowArgs) => new SheetRow<T>(args) as t.ISheetRow<T>;

  /**
   * [Lifecycle]
   */
  private constructor(args: ISheetRowArgs) {
    this.index = args.index;
    this.uri = args.uri;
    this._columns = args.columns;
  }

  /**
   * [Fields]
   */
  private _columns: IRowTypeData[] = [];
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

  private readProp(column: IRowTypeData) {
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

  private writeProp(column: IRowTypeData, value: any) {
    console.log(this.index, 'WRITE', column.type.column, column.type.prop, value);
  }
}

// function getFiel() {

// }
