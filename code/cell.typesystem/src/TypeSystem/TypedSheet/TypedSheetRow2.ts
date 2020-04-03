import { TypeDefault } from '../TypeDefault';
import { TypeTarget } from '../TypeTarget';
import { Schema, t, util, Uri } from './common';
import { TypedSheetRef } from './TypedSheetRef';
import { TypedSheetRefs } from './TypedSheetRefs';

type TypedSheetRowArgs = {
  uri: string | t.IRowUri;
  columns: t.IColumnTypeDef[];
  ctx: t.SheetCtx;
};

/**
 * A strongly-typed row.
 */
export class TypedSheetRow2<T> implements t.ITypedSheetRow<T> {
  public static create = <T>(args: TypedSheetRowArgs): t.ITypedSheetRow<T> => {
    return new TypedSheetRow2<T>(args) as t.ITypedSheetRow<T>;
  };

  public static load = <T>(args: TypedSheetRowArgs): Promise<t.ITypedSheetRow<T>> => {
    return TypedSheetRow2.create<T>(args).load();
  };

  /**
   * [Lifecycle]
   */
  private constructor(args: TypedSheetRowArgs) {
    this.ctx = args.ctx;
    this.uri = util.formatRowUri(args.uri);
    this._columns = args.columns;
    this.index = Number.parseInt(this.uri.key, 10) - 1;
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  private readonly _columns: t.IColumnTypeDef[] = [];
  private readonly _prop: { [key: string]: t.ITypedSheetRowProp<T, any> } = {};
  private _props: t.ITypedSheetRowProps<T>;
  private _types: t.ITypedSheetRowTypes<T>;
  private _data: { [column: string]: t.ICellData } = {};
  private _status: t.ITypedSheetRow<T>['status'] = 'INIT';

  public readonly index: number;
  public readonly uri: t.IRowUri;

  /**
   * [Properties]
   */
  public get status() {
    return this._status;
  }

  public get isLoaded() {
    return this._status === 'LOADED';
  }

  public get types() {
    if (!this._types) {
      type M = t.ITypedSheetRowTypes<T>['map'];
      let map: M | undefined;
      const list = this._columns;
      this._types = {
        list,
        get map() {
          if (!map) {
            map = list.reduce((acc, typeDef) => {
              acc[typeDef.prop] = typeDef;
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
      this._columns.forEach(typeDef => {
        const name = typeDef.prop as keyof T;
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

  public async load(options: { props?: (keyof T)[]; force?: boolean } = {}) {
    this._status = 'LOADING';
    const { props, force } = options;

    if (this.isLoaded && !force) {
      return this;
    }

    const ns = this.uri.ns;
    const query = `${this.uri.key}:${this.uri.key}`;

    await Promise.all(
      this._columns
        .filter(columnDef => (!props ? true : props.includes(columnDef.prop as keyof T)))
        .map(async columnDef => {
          const res = await this.ctx.fetch.getCells({ ns, query });
          const key = `${columnDef.column}${this.index + 1}`;
          this.setData(columnDef, res.cells[key] || {});
        }),
    );

    this._status = 'LOADED';
    return this;
  }

  public toObject(): T {
    return this._columns.reduce((acc, typeDef) => {
      const prop = typeDef.prop;
      acc[prop] = this.prop(prop as keyof T).get();
      return acc;
    }, {}) as T;
  }

  public type(prop: keyof T) {
    const typeDef = this.findColumn(prop);
    if (!typeDef) {
      const err = `The property '${prop}' is not defined by a column on [${this.uri}]`;
      throw new Error(err);
    }
    return typeDef;
  }

  /**
   * Read/write handle for a single cell (property).
   */
  public prop<K extends keyof T>(name: K): t.ITypedSheetRowProp<T, K> {
    if (this._prop[name as string]) {
      return this._prop[name as string]; // Already created and cached.
    }

    const self = this; // tslint:disable-line
    const columnDef = this.findColumn(name);
    const ctx = this.ctx;

    const target = TypeTarget.parse(columnDef.target);
    if (!target.isValid) {
      const err = `Property '${name}' (column ${columnDef.column}) has an invalid target '${columnDef.target}'.`;
      throw new Error(err);
    }

    const api: t.ITypedSheetRowProp<T, K> = {
      /**
       * Get a cell (property) value.
       */
      get(): T[K] {
        const done = (result?: any): T[K] => {
          if (result === undefined && TypeDefault.isTypeDefaultValue(columnDef.default)) {
            // NB: Only look for a default value definition.
            //     If the default value was declared with as a REF, that will have been looked up
            //     and stored as a {value} by the [TypeClient] prior to this sync code being called.
            result = (columnDef.default as t.ITypeDefaultValue).value;
          }

          if (result === undefined && columnDef.type.isArray) {
            result = []; // For array types, an empty array is expected rather than [undefined].
          }

          return result;
        };

        if (!target.isValid) {
          const err = `Cannot read property '${columnDef.prop}' (column ${columnDef.column}) because the target '${columnDef.target}' is invalid.`;
          throw new Error(err);
        }

        const cell = self._data[columnDef.column] || {};

        if (target.isInline) {
          return done(TypeTarget.inline(columnDef).read(cell));
        }

        if (target.isRef) {
          const typeDef = columnDef as t.IColumnTypeDef<t.ITypeRef>;

          // Schema.ref.links.
          const links = cell.links || {};
          const link = Schema.ref.links.find(links).byName('type');

          let ns = link ? link.uri.toString() : '';
          if (!ns) {
            ns = Schema.uri.create.ns(Schema.cuid());
            const key = Schema.ref.links.toKey('type');

            links[key] = ns;
          }

          const ref = columnDef.type.isArray
            ? TypedSheetRefs.create({ ns, typeDef, data: cell, ctx })
            : TypedSheetRef.create({ typeDef, ctx });
          return done(ref);
        }

        throw new Error(`Failed to read property '${name}' (column ${columnDef.column}).`);
      },

      /**
       * Set a cell (property) value.
       */
      set(value: T[K]) {
        if (target.isInline) {
          const cell = self._data[columnDef.column] || {};
          const data = TypeTarget.inline(columnDef).write({ cell, data: value as any });

          // [LATENCY COMPENSATION]
          //    Update local state immediately.
          //    NB: This means reads to the property are immedately available with the new
          //        value, as the global state will be updated after an async tick.
          self.setData(columnDef, data);

          // Fire global state update.
          self.fireChange(columnDef, data);
        }

        if (target.isRef) {
          // TODO 🐷
          // I think we can just throw an error here, because you should not be able to
          // set a REF.  It's all handed within the [TypedSheetRef] wrapper objects.
        }

        return self;
      },

      /**
       * Remove a property value.
       */
      clear() {
        return api.set(undefined as any);
      },
    };

    this._prop[name as string] = api; // Cache.
    return api;
  }

  /**
   * [Helpers]
   */

  private findColumn<K extends keyof T>(prop: K) {
    const res = this._columns.find(def => def.prop === prop);
    if (!res) {
      const err = `Column-definition for the property '${prop}' not found.`;
      throw new Error(err);
    }
    return res;
  }

  private fireChange(columnDef: t.IColumnTypeDef, data: t.ICellData) {
    const key = `${columnDef.column}${this.index + 1}`;
    const uri = Uri.create.cell(this.uri.ns, key);
    this.ctx.events$.next({
      type: 'SHEET/change',
      payload: { cell: uri, data },
    });
  }

  private setData(columnDef: t.IColumnTypeDef, data: t.ICellData) {
    this._data[columnDef.column] = data;
  }
}
