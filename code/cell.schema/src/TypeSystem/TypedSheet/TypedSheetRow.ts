import { t } from '../common';
import { TypeTarget } from '../TypeTarget';
import { TypedSheet } from '../TypedSheet';

type TypedSheetRowCtx = {
  fetch: t.ISheetFetcher;
  events$: t.Subject<t.TypedSheetEvent>;
  cache: t.IMemoryCache;
};

type ITypedSheetRowArgs = {
  index: number;
  uri: string;
  columns: ITypedColumnData[];
  ctx: TypedSheetRowCtx;
};

type ITypedColumnData = {
  type: t.IColumnTypeDef;
  data: t.ICellData;
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
    this.ctx = args.ctx;
    this._columns = args.columns;
  }

  /**
   * [Fields]
   */
  private readonly ctx: TypedSheetRowCtx;
  private readonly _columns: ITypedColumnData[] = [];
  private _props: t.ITypedSheetRowProps<T>;

  public readonly index: number;
  public readonly uri: string;

  /**
   * [Properties]
   */

  public get types() {
    return this._columns.map(({ type }) => type);
  }

  public get props(): t.ITypedSheetRowProps<T> {
    if (!this._props) {
      const toObject = this.toObject;
      const props = { toObject };
      this._columns.forEach(column => {
        Object.defineProperty(props, column.type.prop, {
          get: () => this.readProp(column),
          set: value => this.writeProp(column, value),
        });
      });
      this._props = props as any;
    }
    return this._props;
  }

  /**
   * Methods
   */

  public toObject = (): T => {
    return this._columns.reduce((acc, next) => {
      const key = next.type.prop;
      acc[key] = this.props[key];
      return acc;
    }, {}) as T;
  };

  /**
   * [Internal]
   */

  private readProp(column: ITypedColumnData) {
    // console.log(this.index, 'READ', column.type.column, column.type.prop);
    const { type } = column;
    const { prop } = type;

    const target = TypeTarget.parse(type.target);

    // console.log('target', target);

    if (!target.isValid) {
      const err = `Cannot read property '${type.prop}' (column ${type.column}) because the target '${type.target}' is invalid.`;
      throw new Error(err);
    }

    if (target.isInline) {
      return TypeTarget.inline(type).read(column.data);
    }

    if (target.isRef) {
      // TODO 🐷
      console.log('read ref', column);
      console.log('TypedSheet', TypedSheet);
    }

    // if (target.path === 'value') {
    //   return data.value;
    // } else if (target.startsWith('inline:')) {
    //   const field = target.substring('inline:'.length);

    //   // TODO 🐷 field dot (deep) support.
    //   // console.group('🌳 ');
    //   // console.log('field', field);
    //   // console.log('data.props', data.props);
    //   // console.groupEnd();

    //   return value.object.pluck(field, data.props || {});

    //   // console.log('field', field);
    //   // return (data.props || {})[field];
    // } else {
    //   return; // TEMP 🐷
    // }

    // data.
    return;
  }

  private writeProp(column: ITypedColumnData, value: any) {
    const { type } = column;
    const { prop } = type;

    const target = TypeTarget.parse(type.target);
    if (!target.isValid) {
      const err = `Cannot write property '${type.prop}' (column ${type.column}) because the target '${type.target}' is invalid.`;
      throw new Error(err);
    }

    if (target.isInline) {
      column.data = TypeTarget.inline(type).write({ cell: column.data, data: value });
    }

    if (target.isRef) {
      // TODO 🐷
    }
  }
}
