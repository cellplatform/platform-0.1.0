import { TypeDefault } from '../TypeDefault';
import { TypeTarget } from '../TypeTarget';
import * as t from './types';

type TypedSheetRowArgs = {
  index: number;
  uri: string;
  columns: TypedColumnData[];
  ctx: t.SheetCtx;
};

type TypedColumnData = {
  type: t.IColumnTypeDef;
  data: t.ICellData;
};

/**
 * A strongly-typed row.
 */
export class TypedSheetRow<T> implements t.ITypedSheetRow<T> {
  public static create = <T>(args: TypedSheetRowArgs) => {
    return new TypedSheetRow<T>(args) as t.ITypedSheetRow<T>;
  };

  /**
   * [Lifecycle]
   */
  private constructor(args: TypedSheetRowArgs) {
    this.index = args.index;
    this.uri = args.uri;
    this.ctx = args.ctx;
    this._columns = args.columns;
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  private readonly _columns: TypedColumnData[] = [];
  private _props: t.ITypedSheetRowProps<T>;
  private _prop: { [key: string]: t.ITypedSheetRowProp<T, any> } = {};
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
      const props = {};
      this._columns.forEach(column => {
        const name = column.type.prop as keyof T;
        Object.defineProperty(props, name, {
          get: () => this.prop(name).get(),
          set: value => this.prop(name).set(value),
        });
      });
      this._props = props as any;
    }
    return this._props;
  }

  /**
   * Methods
   */

  public async toObject(): Promise<T> {
    const obj = {};

    await Promise.all(
      this._columns.map(async column => {
        const prop = column.type.prop;
        const value = await this.prop(prop as keyof T).get();
        obj[prop] = value;
      }),
    );

    return (obj as unknown) as T;
  }

  public type(prop: keyof T) {
    const column = this._columns.find(def => def.type.prop === prop);
    if (!column) {
      const err = `The property '${prop}' is not defined by a column on [${this.uri}]`;
      throw new Error(err);
    }
    return column.type;
  }

  /**
   * Read/write handle for a single cell (property).
   */
  public prop<K extends keyof T>(key: K): t.ITypedSheetRowProp<T, K> {
    if (this._prop[key as string]) {
      return this._prop[key as string]; // Already created and cached.
    }

    const column = this.findColumn(key);
    const typeDef = column.type;
    const ctx = this.ctx;

    const target = TypeTarget.parse(typeDef.target);
    if (!target.isValid) {
      const err = `Property '${key}' (column ${typeDef.column}) has an invalid target '${typeDef.target}'.`;
      throw new Error(err);
    }

    const api = {
      /**
       * Get a cell (property) value.
       */
      async get(): Promise<T[K]> {
        const done = (result?: t.Json): T[K] => {
          if (result === undefined && TypeDefault.isTypeDefaultValue(typeDef.default)) {
            // NB: Only look for a default value definition.
            //     If the default value was declared with as a REF, that will have been looked up
            //     and stored as a {value} by the [TypeClient] prior to this sync code being called.
            result = (typeDef.default as t.ITypeDefaultValue).value as any;
          }

          if (result === undefined && typeDef.type.isArray) {
            result = []; // For array types, an empty array is expected rather than [undefined].
          }

          return result as any;
        };

        if (!target.isValid) {
          const err = `Cannot read property '${typeDef.prop}' (column ${typeDef.column}) because the target '${typeDef.target}' is invalid.`;
          throw new Error(err);
        }

        if (target.isInline) {
          return done(TypeTarget.inline(typeDef).read(column.data));
        }

        if (target.isRef) {
          // TODO 🐷
          console.log('-------------------------------------------');
          // console.log('read ref', column.type.column, column.type.prop);
          // console.log('TypedSheet', TypedSheet);

          /**
           * - single
           * - array
           */
          console.log('column', column);
          const type = column.type.type as t.ITypeRef;

          console.log('-------------------------------------------');
          const f = await ctx.sheet.create({ implements: type.uri });

          console.log('-------------------------------------------');
          console.log('f', f);

          return done(); // TODO 🐷
        }

        throw new Error(`Failed to read property '${key}'.`);
      },

      /**
       * Set a cell (property) value.
       */
      async set(value: T[K]): Promise<{}> {
        if (target.isInline) {
          const cell = column.data;
          const data = value as any;
          column.data = TypeTarget.inline(typeDef).write({ cell, data });
        }

        if (target.isRef) {
          // console.log('target', target);
          // TypeTarget.re
          // TODO 🐷
        }

        return {};
      },

      /**
       * Remove a property value.
       */
      async clear(): Promise<{}> {
        return api.set(undefined as any);
      },
    };

    this._prop[key as string] = api;
    return api;
  }

  /**
   * [INTERNAL]
   */

  private findColumn<K extends keyof T>(prop: K) {
    const res = this._columns.find(column => column.type.prop === prop);
    if (!res) {
      const err = `Column-definition for the property '${prop}' not found.`;
      throw new Error(err);
    }
    return res;
  }

  /**
   * Read a property value.
   */
  private readProp(column: TypedColumnData) {
    // console.log(this.index, 'READ', column.type.column, column.type.prop);
    const { type } = column;
    const { prop } = column.type;
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

  /**
   * Write a property value.
   */
  private writeProp(column: TypedColumnData, value: any) {
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
      // console.log('target', target);
      // TypeTarget.re
      // TODO 🐷
    }
  }
}
