import { filter, map } from 'rxjs/operators';

import { TypeDefault, TypeTarget } from '../../TypeSystem.core';
import { Schema, t, Uri, util, R } from './common';
import { TypedSheetRef } from './TypedSheetRef';
import { TypedSheetRefs } from './TypedSheetRefs';

type IArgs = {
  typename: string;
  sheet: t.ITypedSheet;
  uri: string | t.IRowUri;
  columns: t.IColumnTypeDef[];
  ctx: t.SheetCtx;
};

/**
 * Read/write methods for the properties of a single row.
 */
type ITypedSheetRowProp<T, K extends keyof T> = {
  get(): T[K];
  set(value: T[K]): t.ITypedSheetRow<T>;
  clear(): t.ITypedSheetRow<T>;
};

/**
 * A strongly-typed row.
 */
export class TypedSheetRow<T> implements t.ITypedSheetRow<T> {
  public static create = <T>(args: IArgs): t.ITypedSheetRow<T> => {
    return new TypedSheetRow<T>(args) as t.ITypedSheetRow<T>;
  };

  public static load = <T>(args: IArgs): Promise<t.ITypedSheetRow<T>> => {
    return TypedSheetRow.create<T>(args).load();
  };

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this.typename = args.typename;
    this.uri = Uri.row(args.uri);
    this.index = Number.parseInt(this.uri.key, 10) - 1;

    this._columns = args.columns;
    this._ctx = args.ctx;
    this._sheet = args.sheet;

    const cellChange$ = this._ctx.event$.pipe(
      filter(e => e.type === 'SHEET/change'),
      map(e => e.payload as t.ITypedSheetChangeCell),
      filter(e => e.kind === 'CELL'),
      map(({ to, ns, key }) => ({ to, uri: Uri.parse<t.ICellUri>(Uri.create.cell(ns, key)) })),
      filter(({ uri }) => uri.ok && uri.type === 'CELL' && uri.parts.ns === this.uri.ns),
      map(e => ({ ...e, uri: e.uri.parts })),
    );

    // Ensure internal representation of value is updated if some other process signalled the a property to change.
    cellChange$
      .pipe(
        map(e => {
          const columnKey = Schema.coord.cell.toColumnKey(e.uri.key);
          const columnDef = this._columns.find(def => def.column === columnKey) as t.IColumnTypeDef;
          return { ...e, columnDef };
        }),
        filter(e => Boolean(e.columnDef)),
        map(e => ({ ...e, target: TypeTarget.parse(e.columnDef.target) })),
        filter(e => e.target.isValid && e.target.isInline),
      )
      .subscribe(e => {
        this.setData(e.columnDef, e.to);
      });
  }

  /**
   * [Fields]
   */
  private readonly _ctx: t.SheetCtx;
  private readonly _columns: t.IColumnTypeDef[] = [];
  private readonly _prop: { [propname: string]: ITypedSheetRowProp<T, any> } = {};
  private _refs: { [propname: string]: t.ITypedSheetRef<T> | t.ITypedSheetRefs<T> } = {};
  private _props: t.ITypedSheetRowProps<T>;
  private _types: t.ITypedSheetRowTypes<T>;
  private _data: { [column: string]: t.ICellData } = {};
  private _isLoaded = false;
  private _status: t.ITypedSheetRow<T>['status'] = 'INIT';
  private _loading: { [key: string]: Promise<t.ITypedSheetRow<T>> } = {};
  private _sheet: t.ITypedSheet;

  public readonly index: number;
  public readonly typename: string;
  public readonly uri: t.IRowUri;

  /**
   * [Properties]
   */
  public get status() {
    return this._status;
  }

  public get isLoaded() {
    return this._isLoaded;
  }

  public get types() {
    if (!this._types) {
      type M = t.ITypedSheetRowTypes<T>['map'];
      let map: M | undefined;
      let list: t.ITypedSheetRowType[] | undefined;
      const columns = this._columns;
      const row = this.uri;
      const types = (this._types = {
        get list() {
          if (!list) {
            list = columns.map(type => {
              let uri: t.ICellUri | undefined;
              return {
                ...type,
                get uri() {
                  return (
                    uri || (uri = Uri.cell(Uri.create.cell(row.ns, `${type.column}${row.key}`)))
                  );
                },
              };
            });
          }
          return list as t.ITypedSheetRowType[];
        },
        get map() {
          if (!map) {
            map = types.list.reduce((acc, type) => {
              acc[type.prop] = type;
              return acc;
            }, {}) as M;
          }
          return map;
        },
      });
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
  public toString() {
    return this.uri.toString();
  }

  public async load(
    options: { props?: (keyof T)[]; force?: boolean } = {},
  ): Promise<t.ITypedSheetRow<T>> {
    if (this.isLoaded && !options.force) {
      return this;
    }

    const { props } = options;
    const cacheKey = props ? `load:${props.join(',')}` : 'load';
    if (!options.force && this._loading[cacheKey]) {
      return this._loading[cacheKey];
    }

    const promise = new Promise<t.ITypedSheetRow<T>>(async (resolve, reject) => {
      this._status = 'LOADING';

      const ns = this.uri.ns;
      const index = this.index;
      const sheet = this._sheet;

      this.fire({ type: 'SHEET/row/loading', payload: { sheet, index } });

      const query = `${this.uri.key}:${this.uri.key}`;

      await Promise.all(
        this._columns
          .filter(columnDef => (!props ? true : props.includes(columnDef.prop as keyof T)))
          .map(async columnDef => {
            const res = await this._ctx.fetch.getCells({ ns, query });
            const key = `${columnDef.column}${this.index + 1}`;
            this.setData(columnDef, (res.cells || {})[key] || {});
          }),
      );

      // Update state.
      this._status = 'LOADED';
      this._isLoaded = true; // NB: Always true after initial load.

      // Finish up.
      this.fire({ type: 'SHEET/row/loaded', payload: { sheet, index } });
      delete this._loading[cacheKey];
      resolve(this);
    });

    this._loading[cacheKey] = promise; // Cached for repeat calls.
    return promise;
  }

  public toObject(): T {
    return this._columns.reduce((acc, typeDef) => {
      const prop = typeDef.prop;
      acc[prop] = this.prop(prop as keyof T).get();
      return acc;
    }, {}) as T;
  }

  public type(prop: keyof T) {
    const typeDef = this.findColumnByProp(prop);
    if (!typeDef) {
      const err = `The property '${prop}' is not defined by a column on [${this.uri}]`;
      throw new Error(err);
    }
    return typeDef;
  }

  /**
   * Read/write handle for a single cell (property).
   */
  public prop<K extends keyof T>(name: K): ITypedSheetRowProp<T, K> {
    const propname = name as string;
    if (this._prop[propname]) {
      return this._prop[propname]; // Already created and cached.
    }

    const self = this; // tslint:disable-line
    const columnDef = this.findColumnByProp(name);
    const target = TypeTarget.parse(columnDef.target);
    const typename = columnDef.type.typename;

    if (!target.isValid) {
      const err = `Property '${name}' (column ${columnDef.column}) has an invalid target '${columnDef.target}'.`;
      throw new Error(err);
    }

    const api: ITypedSheetRowProp<T, K> = {
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
          if (self._refs[propname]) {
            return done(self._refs[propname]); // NB: Cached instance.
          }

          const links = cell.links;
          const typeDef = columnDef as t.IColumnTypeDef<t.ITypeRef>;
          const res = self.getOrCreateRef({ typename, typeDef, links });
          self._refs[propname] = res.ref; // NB: Cache instance.

          return done(res.ref);
        }

        throw new Error(`Failed to read property '${name}' (column ${columnDef.column}).`);
      },

      /**
       * Set a cell (property) value.
       */
      set(value: T[K]) {
        if (target.isInline) {
          const isChanged = !R.equals(api.get(), value);

          if (isChanged) {
            const cell = self._data[columnDef.column] || {};
            const data = TypeTarget.inline(columnDef).write({ cell, data: value as any });

            // [LATENCY COMPENSATION]
            //
            //    Local state updated immediately via observable change event-handler (in constructor).
            //
            //    NB: This means reads to the property are immedately available with the new value,
            //        or changes made elsewhere in the system are reflected in the current state of the row,
            //        while the global fetch state will be updated after an [async] tick with listeners
            //        being alerted of the new value on the ["SHEET/changed"] event.
            self.fireChange(columnDef, data);
          }
        }

        if (target.isRef) {
          // REF targets cannot be written to directly, rather they are
          // stored as links on the row's cell.
          const err = `Cannot write to property '${name}' (column ${columnDef.column}) because it is a REF target.`;
          throw new Error(err);
        }

        return self;
      },

      /**
       * Remove a property value.
       */
      clear() {
        if (target.isInline) {
          api.set(undefined as any);
        }
        return self;
      },
    };

    this._prop[name as string] = api; // Cache.
    return api;
  }

  /**
   * [Helpers]
   */

  private fire(e: t.TypedSheetEvent) {
    this._ctx.event$.next(e);
  }

  private findColumnByProp<K extends keyof T>(prop: K) {
    const res = this._columns.find(def => def.prop === prop);
    if (!res) {
      const err = `Column-definition for the property '${prop}' not found.`;
      throw new Error(err);
    }
    return res;
  }

  private fireChange(columnDef: t.IColumnTypeDef, to: t.ICellData) {
    const key = `${columnDef.column}${this.index + 1}`;
    const ns = Uri.create.ns(this.uri.ns);
    this._ctx.event$.next({
      type: 'SHEET/change',
      payload: { kind: 'CELL', ns, key, to },
    });
  }

  private setData(columnDef: t.IColumnTypeDef, data: t.ICellData) {
    this._data[columnDef.column] = data;
  }

  private getOrCreateRef(args: {
    typename: string;
    typeDef: t.IColumnTypeDef<t.ITypeRef>;
    links?: t.IUriMap;
  }) {
    const { typename, typeDef, links = {} } = args;
    const ctx = this._ctx;
    const isArray = typeDef.type.isArray;
    const { link } = TypedSheetRefs.refLink({ typeDef, links });
    const exists = Boolean(link);

    const uri = Uri.create.cell(this.uri.ns, `${typeDef.column}${this.index + 1}`);
    const parent: t.ITypedSheetRefParent = {
      cell: Uri.cell(uri),
      sheet: this._sheet,
    };

    const ref = isArray
      ? TypedSheetRefs.create({ typename, typeDef, ctx, parent })
      : TypedSheetRef.create({ typename, typeDef, ctx });

    return { ref, exists };
  }
}
