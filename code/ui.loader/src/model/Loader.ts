import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import { t } from '../common';

export type ILoaderArgs = {};

type IItem = {
  id: string;
  module: t.IDynamicModule;
  render: t.DynamicRender;
};

/**
 * Manages configuring and loading dynamic modules.
 */
export class Loader {
  /**
   * [Lifecycle]
   */
  public static create = (args: ILoaderArgs = {}) => new Loader(args);
  private constructor(args: ILoaderArgs) {}

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _items: IItem[] = [];

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.LoaderEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get count() {
    return this.modules.length;
  }

  public get modules() {
    return this._items.map(item => item.module) || [];
  }

  /**
   * [Methods]
   */
  public add(id: string, render: t.DynamicRender) {
    this.throwIfDisposed('add');
    if (this.exists(id)) {
      throw new Error(`A module with the id '${id}' has already been added.`);
    }
    const item: IItem = {
      id,
      module: { id, render, isLoaded: false },
      render: async () => {
        const el = await render();
        item.module.isLoaded = true;
        this.fire({ type: 'LOADER/loaded', payload: { id, module: item.module, el } });
        return el;
      },
    };
    this._items = [...this._items, item];
    this.fire({ type: 'LOADER/added', payload: { id, module: item.module } });
    return this;
  }

  public get(id: string | number) {
    this.throwIfDisposed('get');
    const item = this.item(id);
    return item ? item.module : undefined;
  }
  private item(id: string | number) {
    return typeof id === 'number' ? this._items[id] : this._items.find(m => m.id === id);
  }

  public exists(id: string | number) {
    this.throwIfDisposed('exists');
    return Boolean(this.get(id));
  }

  public async render(id: string | number) {
    this.throwIfDisposed('render');
    const item = this.item(id);
    return item ? item.render() : undefined;
  }

  public isLoaded(id: string | number) {
    const item = this.get(id);
    return item ? item.isLoaded : false;
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because Loader is disposed.`);
    }
  }

  private fire(e: t.LoaderEvent) {
    this._events$.next(e);
  }
}
