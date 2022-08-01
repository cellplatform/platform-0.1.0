import { filter, map } from 'rxjs/operators';

import { TypeDefault, TypeTarget } from '../../TypeSystem.core';
import { coord, R, rx, Schema, t, Uri } from './common';
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
type ITypedSheetRowProp<T, K extends keyof T, P extends keyof T[K]> = {
  get(): T[K][P];
  set(value: T[K][P]): t.ITypedSheetRow<T, K>;
  clear(): t.ITypedSheetRow<T, K>;
};

/**
 * A strongly-typed row.
 */
export class TypedSheetRow<T, K extends keyof T> implements t.ITypedSheetRow<T, K> {
  public static create<T, K extends keyof T>(args: IArgs) {
    return new TypedSheetRow<T, K>(args) as t.ITypedSheetRow<T, K>;
  }

  public static load<T, K extends keyof T>(args: IArgs): Promise<t.ITypedSheetRow<T, K>> {
    return TypedSheetRow.create<T, K>(args).load();
  }

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

    const event$ = this._ctx.event$;
    const cellChange$ = event$.pipe(
      filter((e) => e.type === 'TypedSheet/change'),
      map((e) => e.payload as t.ITypedSheetChangeCell),
      filter((e) => e.kind === 'CELL'),
      filter((e) => this.isThisSheet(e.ns)),
      filter((e) => this.isThisRow(e.key)),
      map(({ to, ns, key }) => ({ key, to, uri: Uri.parse<t.ICellUri>(Uri.create.cell(ns, key)) })),
      filter(({ uri }) => uri.ok && uri.type === 'CELL'),
      map((e) => ({ ...e, uri: e.uri.parts, index: coord.cell.toRowIndex(e.key) })),
      filter((e) => e.index === this.index),
    );

    /**
     * Ensure internal representation of value is updated if
     * some other process signalled the a change to a property.
     */
    cellChange$
      .pipe(
        map((e) => ({ ...e, columnDef: this.findColumnByKey(e.uri.key) })),
        filter((e) => Boolean(e.columnDef)),
        map((e) => ({ ...e, target: TypeTarget.parse(e.columnDef.target) })),
        filter((e) => e.target.isValid && e.target.isInline),
      )
      .subscribe((e) => this.setData(e.columnDef, e.to));

    // Change initiated via cache-sync.
    rx.payload<t.ITypedSheetSyncEvent>(event$, 'TypedSheet/sync')
      .pipe(
        filter((e) => this.isThisSheet(e.changes.uri)),
        filter((e) => Boolean(e.changes.cells)),
      )
      .subscribe((e) => {
        const data = e.changes.cells || {};
        Object.keys(data)
          .filter((key) => this.isThisRow(key))
          .map((key) => ({ key, value: data[key], columnDef: this.findColumnByKey(key) }))
          .filter(({ columnDef }) => Boolean(columnDef))
          .forEach((e) => this.setData(e.columnDef, e.value.to));
      });
  }

  /**
   * [Fields]
   */
  private readonly _ctx: t.SheetCtx;
  private readonly _columns: t.IColumnTypeDef[] = [];
  private readonly _prop: { [propname: string]: ITypedSheetRowProp<T, K, any> } = {};
  private _refs: { [propname: string]: t.ITypedSheetRef<T, K> | t.ITypedSheetRefs<T, K> } = {};
  private _props: t.ITypedSheetRowProps<T[K]>;
  private _types: t.ITypedSheetRowTypes<T[K]>;
  private _data: { [column: string]: t.ICellData } = {};
  private _isLoaded = false;
  private _status: t.ITypedSheetRow<T, K>['status'] = 'INIT';
  private _loading: { [key: string]: Promise<t.ITypedSheetRow<T, K>> } = {};
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
      type M = t.ITypedSheetRowTypes<T[K]>['map'];
      let map: M | undefined;
      let list: t.ITypedSheetRowType[] | undefined;
      const columns = this._columns;
      const row = this.uri;
      const types = (this._types = {
        get list() {
          if (!list) {
            list = columns.map((type) => {
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

  public get props(): t.ITypedSheetRowProps<T[K]> {
    if (!this._props) {
      const props = {};
      this._columns.forEach((typeDef) => {
        const name = typeDef.prop as keyof T[K];
        Object.defineProperty(props, name, {
          get: () => this.prop(name).get(),
          set: (value) => this.prop(name).set(value),
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
    options: { props?: (keyof T[K])[]; force?: boolean } = {},
  ): Promise<t.ITypedSheetRow<T, K>> {
    const self = this as unknown as t.ITypedSheetRow<T, K>; // eslint-disable-line

    if (this.isLoaded && !options.force) {
      return self;
    }

    const { props } = options;
    const cacheKey = props ? `load:${props.join(',')}` : 'load';
    if (!options.force && (await this._loading[cacheKey])) {
      return this._loading[cacheKey];
    }

    const promise = new Promise<t.ITypedSheetRow<T, K>>(async (resolve, reject) => {
      this._status = 'LOADING';

      const ns = this.uri.ns;
      const index = this.index;
      const sheet = this._sheet;

      this.fire({ type: 'TypedSheet/row/loading', payload: { sheet, index } });

      const query = `${this.uri.key}:${this.uri.key}`;

      await Promise.all(
        this._columns
          .filter((columnDef) => (!props ? true : props.includes(columnDef.prop as keyof T[K])))
          .map(async (columnDef) => {
            const res = await this._ctx.fetch.getCells({ ns, query });
            const key = `${columnDef.column}${this.index + 1}`;
            this.setData(columnDef, (res.cells || {})[key] || {});
          }),
      );

      // Update state.
      this._status = 'LOADED';
      this._isLoaded = true; // NB: Always true after initial load.

      // Finish up.
      this.fire({ type: 'TypedSheet/row/loaded', payload: { sheet, index } });
      delete this._loading[cacheKey];
      resolve(self);
    });

    this._loading[cacheKey] = promise; // Cached for repeat calls.
    return promise;
  }

  public toObject(): T[K] {
    return this._columns.reduce((acc, typeDef) => {
      const prop = typeDef.prop as keyof T[K];
      acc[prop as string] = this.prop(prop).get();
      return acc;
    }, {}) as T[K];
  }

  public type(prop: keyof T[K]) {
    const typeDef = this.findColumnByProp(prop);
    if (!typeDef) {
      const err = `The property '${String(prop)}' is not defined by a column on [${this.uri}]`;
      throw new Error(err);
    }
    return typeDef;
  }

  /**
   * Read/write handle for a single cell (property).
   */
  public prop<P extends keyof T[K]>(name: P): ITypedSheetRowProp<T, K, P> {
    const propname = name as string;
    if (this._prop[propname]) {
      return this._prop[propname]; // Already created and cached.
    }

    const self = this; // eslint-disable-line
    const columnDef = this.findColumnByProp(name);
    const target = TypeTarget.parse(columnDef.target);
    const typename = columnDef.type.typename;

    if (!target.isValid) {
      const err = `Property '${String(name)}' (column ${columnDef.column}) has an invalid target '${
        columnDef.target
      }'.`;
      throw new Error(err);
    }

    const api: ITypedSheetRowProp<T, K, P> = {
      /**
       * Get a cell (property) value.
       */
      get(): T[K][P] {
        const done = (result?: any): T[K][P] => {
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

        throw new Error(`Failed to read property '${String(name)}' (column ${columnDef.column}).`);
      },

      /**
       * Set a cell (property) value.
       */
      set(value: T[K][P]) {
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
            //        being alerted of the new value on the ["TypedSheet/changed"] event.
            self.fireChange(columnDef, data);
          }
        }

        if (target.isRef) {
          // REF targets cannot be written to directly, rather they are
          // stored as links on the row's cell.
          const n = String(name);
          const err = `Cannot write to property '${n}' (column ${columnDef.column}) because it is a REF target.`;
          throw new Error(err);
        }

        return self as t.ITypedSheetRow<T, K>;
      },

      /**
       * Remove a property value.
       */
      clear() {
        if (target.isInline) {
          api.set(undefined as any);
        }
        return self as t.ITypedSheetRow<T, K>;
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

  private isThisSheet(ns: string) {
    return Uri.strip.ns(ns) === this.uri.ns;
  }

  private isThisRow(key: string) {
    return coord.cell.toRowIndex(key) === this.index;
  }

  private findColumnByKey(key: string) {
    const columnKey = Schema.coord.cell.toColumnKey(key);
    return this._columns.find((def) => def.column === columnKey) as t.IColumnTypeDef;
  }

  private findColumnByProp<P extends keyof T[K]>(prop: P) {
    const res = this._columns.find((def) => def.prop === prop);
    if (!res) {
      const err = `Column-definition for the property '${String(prop)}' not found.`;
      throw new Error(err);
    }
    return res;
  }

  private fireChange(columnDef: t.IColumnTypeDef, to: t.ICellData) {
    const key = `${columnDef.column}${this.index + 1}`;
    const ns = Uri.create.ns(this.uri.ns);
    this._ctx.event$.next({
      type: 'TypedSheet/change',
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
