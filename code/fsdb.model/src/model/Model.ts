import { Subject } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';
import { R, defaultValue, t, time } from './common';

export type IModelArgs<
  P extends object,
  D extends P,
  L extends t.IModelLinksSchema,
  C extends t.IModelChildrenSchema
> = {
  db: t.IDb;
  path: string;
  initial: D;
  typename?: string;
  load?: boolean;
  events$?: Subject<t.ModelEvent>;
  links?: t.IModelLinkDefs<L>;
  children?: t.IModelChildrenDefs<C>;
  beforeSave?: t.BeforeModelSave<P, D, L, C>;
  beforeDelete?: t.BeforeModelDelete<P, D, L, C>;
};

/**
 * A strongly typed wrapper around a database representing a
 * single conceptual "model", and it's relationships.
 *
 *  - data (doc)
 *  - children (path descendent relationships)
 *  - links (JOIN relationships)
 *  - read|write (change management)
 *  - caching
 *
 */
export class Model<
  P extends object, //                          Properties.
  D extends P = P, //                           Document properties (if additional to props, ie hidden values).
  L extends t.IModelLinksSchema = any, //       Link references.
  C extends t.IModelChildrenSchema = any //     Child documents.
> implements t.IModel<P, D, L, C> {
  /**
   * [Lifecycle]
   */
  public static create = <
    P extends object,
    D extends P = P,
    L extends t.IModelLinksSchema = any,
    C extends t.IModelChildrenSchema = any
  >(
    args: IModelArgs<P, D, L, C>,
  ) => new Model<P, D, L, C>(args);

  private constructor(args: IModelArgs<P, D, L, C>) {
    // Prepare path.
    const path = (args.path || '').trim();
    args = args.path === path ? args : { ...args, path };
    if (!path) {
      throw new Error(`A model must have a path.`);
    }

    // Store args.
    this._args = args;

    // Bubble events.
    const events$ = args.events$;
    if (events$) {
      this.events$.subscribe(e => events$.next(e));
    }

    // Load data from storage.
    if (defaultValue(args.load, true)) {
      this.load();
    }
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _args: IModelArgs<P, D, L, C>;
  private _item: t.IDbValue | undefined;
  private _props: P;
  private _links: t.IModelLinks<L>;
  private _children: t.IModelChildren<C>;
  private _linkCache = {};
  private _childrenCache = {};
  private _changes: Array<t.IModelChange<P, D>> = [];
  private _typename: string;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.ModelEvent>();
  public readonly events$ = this._events$.pipe(takeUntil(this.dispose$), share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get isLoaded() {
    return Boolean(this._item);
  }

  public get isChanged() {
    const changes = this.changes;
    if (changes.list.length === 0) {
      return false;
    } else {
      // Ensure registered changes differ from current values.
      const map = changes.map;
      return Object.keys(map).some(key => !R.equals(this.doc[key], map[key]));
    }
  }

  public get exists() {
    return this._item ? this._item.props.exists : undefined;
  }

  public get db() {
    return this._args.db;
  }

  public get path() {
    return this._args.path;
  }

  public get typename() {
    if (!this._typename) {
      this._typename = (this._args.typename || this.path.split('/')[0]).trim();
    }
    return this._typename;
  }

  public get ready() {
    return new Promise<t.IModel<P, D, L>>(resolve => {
      if (this.isLoaded) {
        resolve(this);
      } else {
        this.events$
          .pipe(filter(e => e.type === 'MODEL/loaded/data', take(1)))
          .subscribe(e => resolve(this));
      }
    });
  }

  public get createdAt() {
    return this._item ? this._item.props.createdAt : -1;
  }

  public get modifiedAt() {
    return this._item ? this._item.props.modifiedAt : -1;
  }

  public get changes(): t.IModelChanges<P, D> {
    this.throwIfDisposed('changes');
    const list = this._changes || [];
    const length = list.length;
    let map: t.IModelChanges<P, D>['map'] | undefined;
    return {
      length,
      list,
      get map() {
        if (!map) {
          map = list.reduce((acc, next) => {
            return { ...acc, [next.field]: next.value.to };
          }, {}) as t.IModelChanges<P, D>['map'];
        }
        return map;
      },
    };
  }

  public get doc(): D {
    const item = this._item;
    const res = item ? ((item.value as unknown) as P) : undefined;
    return (res || {}) as D;
  }

  public get props(): P {
    this.throwIfDisposed('props');
    if (!this._props) {
      const res = {} as any;
      Object.keys(this._args.initial).forEach(field => {
        Object.defineProperty(res, field, {
          get: () => this.readField(field),
          set: value => this.changeField('PROP', field, value),
        });
      });
      this._props = res;
    }
    return this._props;
  }

  public get links(): t.IModelLinks<L> {
    this.throwIfDisposed('links');
    if (!this._links) {
      this._links = {} as any;
      const defs = this._args.links || {};
      Object.keys(defs).forEach(field =>
        Object.defineProperty(this._links, field, {
          get: () => this.resolveLink(field),
        }),
      );
    }
    return this._links;
  }

  public get children(): t.IModelChildren<C> {
    this.throwIfDisposed('children');
    if (!this._children) {
      this._children = {} as any;
      const defs = this._args.children || {};
      Object.keys(defs).forEach(field =>
        Object.defineProperty(this._children, field, {
          get: () => this.resolveChildren(field),
        }),
      );
    }
    return this._children;
  }

  /**
   * [Methods]
   */

  /**
   * Loads the model's data from the DB.
   */
  public async load(
    options: {
      force?: boolean;
      withLinks?: boolean;
      withChildren?: boolean;
      silent?: boolean;
    } = {},
  ) {
    this.throwIfDisposed('load');
    let fireEvent = false;
    if (options.force) {
      this.reset();
    }

    // Retrieve model data from the DB.
    if (!this._item) {
      this._item = await this.db.get(this.path);
      fireEvent = true;
    }

    // Load links (if required).
    const withLinks = Boolean(options.withLinks);
    if (withLinks) {
      const cachedLinks = Object.keys(this._linkCache);
      const defs = this._args.links || {};
      fireEvent = cachedLinks.length < Object.keys(defs).length ? true : fireEvent;
      const wait = Object.keys(defs).map(key => this.links[key]);
      await Promise.all(wait);
    }

    // Load children (if required).
    const withChildren = Boolean(options.withChildren);
    if (withChildren) {
      const cachedChildren = Object.keys(this._childrenCache);
      const defs = this._args.children || {};
      fireEvent = cachedChildren.length < Object.keys(defs).length ? true : fireEvent;
      const wait = Object.keys(defs).map(key => this.children[key]);
      await Promise.all(wait);
    }

    // Alert listeners.
    if (fireEvent && !options.silent) {
      const typename = this.typename;
      this.fire({
        type: 'MODEL/loaded/data',
        typename,
        payload: { model: this, withLinks, withChildren },
      });
    }

    // Finish up.
    return this.props;
  }

  /**
   * Clears cached model data.
   */
  public reset() {
    this.throwIfDisposed('reset');
    this._item = undefined;
    this._linkCache = {};
    this._childrenCache = {};
    return this;
  }

  /**
   * Set the given set of property values.
   * NB: Same as calling `model.props.xxx = xyz` individually on each property.
   */
  public set(props: Partial<P>) {
    if (typeof props === 'object') {
      Object.keys(props).forEach(key => (this.props[key] = props[key]));
    }
    return this;
  }

  /**
   * Runs the `beforeSave` handler (if one was given to the constructor)
   * which prepares the model for saving.
   */
  public async beforeSave(options: { force?: boolean } = {}) {
    this.throwIfDisposed('beforeSave');
    const { beforeSave } = this._args;
    const { force = false } = options;
    const typename = this.typename;
    let changes = this.changes;
    let isChanged = changes.length > 0;

    // Prepare handler
    let isCancelled = false;
    const payload: t.IModelSave<P, D, L, C> = {
      force,
      isChanged,
      model: this,
      changes,
      get isCancelled() {
        return isCancelled;
      },
      cancel() {
        isCancelled = true;
      },
    };

    // Invoke handler.
    if (beforeSave) {
      // return { payload };
      await beforeSave(payload);
    }

    // Finish up.
    changes = this.changes;
    isChanged = changes.length > 0;
    this.fire({
      type: 'MODEL/beforeSave',
      typename,
      payload: { ...payload, changes, isChanged },
    });
    return { payload };
  }

  /**
   * Persists changes to the underlying store.
   */
  public async save(options: { force?: boolean } = {}): Promise<t.IModelSaveResponse<P, D, L, C>> {
    this.throwIfDisposed('save');
    const { force = false } = options;

    // Run BEFORE operation.
    const res = await this.beforeSave({ force });
    if (res.payload.isCancelled) {
      const changes = this.changes;
      const isChanged = changes.length > 0;
      return { saved: false, isChanged, changes };
    }

    if (!force && this.exists && !this.isChanged) {
      this._changes = [];
      const changes = this.changes;
      const isChanged = changes.length > 0;
      return { saved: false, isChanged, changes };
    }

    // Save to the DB.
    const changes = this.changes;
    const doc = this.exists
      ? { ...this.doc, ...changes.map }
      : { ...this._args.initial, ...changes.map };
    await this.db.put(this.path, doc as any);

    // Update model state.
    this._changes = [];
    await this.load({ force: true, silent: true });

    // Fire AFTER event.
    const isChanged = changes.length > 0;
    const payload = res.payload;
    payload.isChanged = isChanged;
    payload.changes = changes;
    this.fire({
      type: 'MODEL/saved',
      typename: this.typename,
      payload,
    });

    // Finish up.
    return { saved: true, isChanged, changes };
  }

  /**
   * Runs the `beforeDelete` handler (if one was given to the constructor).
   */
  public async beforeDelete() {
    this.throwIfDisposed('beforeDelete');
    const { beforeDelete } = this._args;

    // Prepare handler.
    let isCancelled = false;
    const payload: t.IModelDelete<P, D, L, C> = {
      model: this,
      get isCancelled() {
        return isCancelled;
      },
      cancel() {
        isCancelled = true;
      },
    };

    // Invoke handler.
    if (beforeDelete) {
      await beforeDelete(payload);
    }

    // Finish up.
    this.fire({
      type: 'MODEL/beforeDelete',
      typename: this.typename,
      payload,
    });
    return { payload };
  }

  /**
   * Deletes the model and all dependent children.
   */
  public async delete(): Promise<t.IModelDeleteResponse> {
    // Run BEFORE operation.
    const res = await this.beforeDelete();
    if (res.payload.isCancelled) {
      return { deleted: false, total: 0, children: 0 };
    }

    // Delete children models.
    const children = (await this.children.all) || [];
    if (children.length > 0) {
      const wait = children.map(child => child.delete());
      await Promise.all(wait);
    }

    // Delete the model itself.
    await this.db.delete(this.path);
    this.reset();

    this.fire({
      type: 'MODEL/deleted',
      typename: this.typename,
      payload: res.payload,
    });

    // Finish up.
    return {
      deleted: true,
      total: children.length + 1,
      children: children.length,
    };
  }

  /**
   * Convert the model props to a simple object.
   */
  public toObject(): P {
    this.throwIfDisposed('toObject');
    if (!this.isLoaded) {
      return ({} as any) as P;
    }
    const props = this.props;
    return Object.keys(this._args.initial).reduce((acc, key) => {
      acc[key] = props[key];
      return acc;
    }, {}) as P;
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because Model is disposed.`);
    }
  }

  private fire(e: t.ModelEvent) {
    this._events$.next(e);
  }

  private resolveLink(field: string, options: { autoLoad?: boolean } = {}) {
    const db = this.db;
    const defs = (this._args.links || {}) as t.IModelLinkDefs<L>;
    const def = defs[field];
    const { relationship } = def;

    const key = def.field || field;
    const isOne = relationship === '1:1';
    const isMany = relationship === '1:*';

    if (!def) {
      throw new Error(`A link definition for field '${field}' could not be found.`);
    }

    // Link resolver.
    const promise: any = new Promise<L[keyof L] | undefined>(async resolve => {
      const cached = this._linkCache[key];
      if (cached) {
        return resolve(cached);
      }
      if (!this.isLoaded && defaultValue(options.autoLoad, true)) {
        await this.load();
      }

      let model: any;
      if (isOne) {
        const path = this.currentValue<string>(key);
        model = path ? await def.factory({ db, path }).ready : undefined;
      }
      if (isMany) {
        const paths = this.currentValue<string[]>(key) || [];
        model = await Promise.all(paths.map(path => def.factory({ db, path }).ready));
      }
      this._linkCache[key] = model;

      this.fire({
        type: 'MODEL/loaded/link',
        typename: this.typename,
        payload: { model: this, field },
      });
      return resolve(model);
    });

    // Add and remove API for model-relationship links.
    if (isOne) {
      promise.link = (path: string) => this.changeField('LINK', key, path);
      promise.unlink = () => {
        this.changeField('LINK', key, undefined);
      };
    }
    if (isMany) {
      const getChanges = (op: 'LINK' | 'UNLINK', field: string, paths?: string[]) => {
        const changes = this.changes;
        const changeExists = Object.keys(this.changes.map).includes(field);
        const current = [...(this.currentValue<string[]>(field) || [])].sort();
        const isChanged =
          changeExists && Array.isArray(paths)
            ? op === 'LINK'
              ? !paths.every(path => current.includes(path))
              : paths.some(path => current.includes(path))
            : true;
        return {
          changes,
          isChanged,
          current,
          paths: R.uniq([...current, ...(paths || [])]).sort(),
        };
      };

      promise.link = (paths: string[]) => {
        paths = [...paths].sort();
        if ((paths || []).length > 0) {
          const changes = getChanges('LINK', key, paths);
          if (changes.isChanged) {
            this.changeField('LINK', key, changes.paths);
          }
        }
      };

      promise.unlink = (paths?: string[]) => {
        paths = [...(paths || [])].sort();
        paths = (paths || []).length === 0 ? undefined : paths;
        const changes = getChanges('UNLINK', key, paths);
        if (Array.isArray(paths)) {
          if (changes.isChanged) {
            // Remove specific links.
            paths = changes.paths.filter(path => !(paths || []).includes(path));
            paths = paths.length === 0 ? undefined : paths;
            this.changeField('LINK', key, paths);
          }
        } else {
          if (changes.isChanged) {
            // Clear all links.
            this.changeField('LINK', key, undefined);
          }
        }
      };
    }

    // Finish up.
    return promise;
  }

  private resolveChildren(field: string, options: { autoLoad?: boolean } = {}) {
    const db = this.db;
    const defs = (this._args.children || {}) as t.IModelChildrenDefs<C>;
    const def = defs[field];
    if (!def) {
      throw new Error(`A children definition for field '${field}' could not be found.`);
    }

    // Prepare the child descendents query.
    let query = (def.query || '')
      .trim()
      .replace(/^\/*/, '')
      .trim();
    query = `${this.path}/${query}`;

    // Children resolver.
    const promise: any = new Promise<C[keyof C] | undefined>(async resolve => {
      const cached = this._childrenCache[field];
      if (cached) {
        return resolve(cached);
      }
      if (!this.isLoaded && defaultValue(options.autoLoad, true)) {
        await this.load();
      }
      const paths = (await db.find(query)).list
        .filter(item => item.props.key !== this.path)
        .map(item => item.props.key);
      const children = await Promise.all(paths.map(path => def.factory({ db, path }).ready));
      this._childrenCache[field] = children;

      this.fire({
        type: 'MODEL/loaded/children',
        typename: this.typename,
        payload: { model: this, children, field },
      });
      resolve(children as any);
    });

    // Finish up.
    return promise;
  }

  private currentValue<T>(field: string) {
    const changes = this.changes.map;
    const isChanged = Object.keys(changes).includes(field);
    return (isChanged ? changes[field] : this.doc[field]) as T;
  }

  private readField(field: string) {
    let res = this.isChanged ? this.changes.map[field] || this.doc[field] : this.doc[field];
    const payload: t.IModelReadProp<P, D, L> = {
      model: this,
      field,
      value: res,
      doc: this.doc,
      isModified: false,
      modify(value: any) {
        res = value;
        payload.isModified = true;
      },
    };
    this.fire({ type: 'MODEL/read/prop', typename: this.typename, payload });
    return res;
  }

  private changeField(kind: t.ModelValueKind, field: string, value: any) {
    const typename = this.typename;
    const changes = this.changes.map;
    const hasChangeEntry = Object.keys(changes).includes(field);
    let isCancelled = false;

    // Check: No change from current modification.
    if (hasChangeEntry && changes[field] === value) {
      return { isValueChanged: false, isCancelled };
    }

    // Check: No change from current value (and is not a revert).
    const isOriginalValue = R.equals(value, this.doc[field]);
    if (!hasChangeEntry && isOriginalValue) {
      // If the field has never been changed,
      // do not register the same value as a change.
      return { isValueChanged: false, isCancelled };
    }

    const reverted = hasChangeEntry && isOriginalValue;
    const change = this.getChange({ kind, field, value, reverted });

    // Fire BEFORE event.
    this.fire({
      type: 'MODEL/changing',
      typename,
      payload: {
        change,
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
        },
      },
    });

    if (isCancelled) {
      return { isValueChanged: false, isCancelled: true };
    }

    // Remove from cache.
    if (Object.keys(this._linkCache).includes(field)) {
      delete this._linkCache[field];
    }

    // Store the change entry.
    this._changes = [...this._changes, change];
    this.fire({ type: 'MODEL/changed', typename, payload: change });
    return { isValueChanged: true, isCancelled };
  }

  private getChange(args: {
    kind: t.ModelValueKind;
    field: string;
    value: any;
    reverted: boolean;
  }): t.IModelChange<P, D> {
    const { kind, field, value, reverted } = args;
    const to = { ...this.doc, [field]: value };
    return {
      kind,
      field,
      path: this.path,
      doc: { from: { ...this.doc }, to },
      modifiedAt: time.now.timestamp,
      value: { from: this.doc[field], to: value },
      reverted,
    };
  }
}
