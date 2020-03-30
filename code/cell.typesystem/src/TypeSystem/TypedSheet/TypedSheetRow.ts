import { t } from '../../common';
import { TypeTarget } from '../TypeTarget';
import { TypeDefault } from '../TypeDefault';

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
  private _types: t.ITypedSheetRowTypes<T>;

  public readonly index: number;
  public readonly uri: string;

  /**
   * [Properties]
   */
  public get types() {
    if (!this._types) {
      type M = t.ITypedSheetRowTypes<T>['map'];
      const columns = this._columns;
      let list: t.IColumnTypeDef[] | undefined;
      let map: M | undefined;

      this._types = {
        get list() {
          return list || (list = columns.map(({ type }) => type));
        },
        get map() {
          if (!map) {
            map = columns.reduce((acc, column) => {
              acc[column.type.prop] = column.type;
              return acc;
            }, {}) as M;
          }
          return map;
        },
      };
    }
    return this._types;
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
  public type(prop: keyof T) {
    const column = this._columns.find(def => def.type.prop === prop);
    if (!column) {
      const err = `The property '${prop}' is not defined by a column on [${this.uri}]`;
      throw new Error(err);
    }
    return column.type;
  }

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

    const done = (result?: t.Json) => {
      if (result === undefined && TypeDefault.isTypeDefaultValue(type.default)) {
        // NB: Only look for a default value definition.
        //     If the default value was declared with as a REF, that will have been looked up
        //     and stored as a {value} by the [TypeClient] prior to this sync code being called.
        return (type.default as t.ITypeDefaultValue).value;
      } else {
        return result;
      }
    };

    if (!target.isValid) {
      const err = `Cannot read property '${type.prop}' (column ${type.column}) because the target '${type.target}' is invalid.`;
      throw new Error(err);
    }

    if (target.isInline) {
      return done(TypeTarget.inline(type).read(column.data));
    }

    if (target.isRef) {
      // TODO 🐷
      // console.log('read ref', column);
      // console.log('TypedSheet', TypedSheet);
    }

    // data.
    return done();
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
