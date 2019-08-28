import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import { t } from '../common';

export type ILoaderArgs = {};

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
  private _modules: t.IDynamicModule[] = [];

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
    return this._modules || [];
  }

  /**
   * [Methods]
   */
  public add(id: string, render: t.DynamicRender) {
    this.throwIfDisposed('add');
    if (this.exists(id)) {
      throw new Error(`A module with the id '${id}' has already been added.`);
    }
    const item: t.IDynamicModule = { id, render };
    this._modules = [...this._modules, item];
    this.fire({ type: 'LOADER/added', payload: { id, module: item } });
    return this;
  }

  public get(id: string | number) {
    this.throwIfDisposed('get');
    return typeof id === 'number' ? this.modules[id] : this.modules.find(m => m.id === id);
  }

  public exists(id: string | number) {
    this.throwIfDisposed('exists');
    return Boolean(this.get(id));
  }

  public async render(id: string | number) {
    this.throwIfDisposed('render');
    const item = this.get(id);
    return item ? item.render() : undefined;
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
