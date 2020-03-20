import { t } from '../common';
import { TypeTarget } from '../TypeTarget';

type ITypedColumnData = {
  type: t.IColumnTypeDef;
  data: t.ICellData;
};

type ITypedSheetRowArgs = {
  index: number;
  uri: string;
  columns: ITypedColumnData[];
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

    if (!target.isValid) {
      return;
    }

    if (target.isInline) {
      return TypeTarget.read(type).inline(column.data);
    }

    if (target.isRef) {
      // TODO 🐷
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
  }

  private writeProp(column: ITypedColumnData, value: any) {
    // console.log(this.index, 'WRITE', column.type.column, column.type.prop, value);
  }
}
