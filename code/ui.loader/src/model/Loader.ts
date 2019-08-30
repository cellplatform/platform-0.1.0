import * as React from 'react';

import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { defaultValue, id as idUtil, t } from '../common';

export type ILoaderArgs = {};

const DEFAULT = {
  TIMEOUT: 10000, // 10-seconds.
};

/**
 * Manages loading dynamic modules.
 */
export class Loader implements t.ILoader {
  public static DEFAULT = DEFAULT;

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
  private _modules: Array<t.IDynamicModule<any>> = [];
  private _loading: string[] = [];
  private _getContext: Array<t.LoaderContextUpdateProps<any>> = [];

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.LoaderEvents>();
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

  public get length() {
    return this.modules.length;
  }

  public get modules() {
    return this._modules;
  }

  public get loading() {
    return this._loading;
  }

  /**
   * [Methods]
   */
  public add(moduleId: string, load: t.DynamicImport, options: { timeout?: number } = {}) {
    this.throwIfDisposed('add');
    if (this.exists(moduleId)) {
      throw new Error(`A module with the id '${moduleId}' has already been added.`);
    }

    // Store a reference to the module.
    const item: t.IDynamicModule = {
      id: moduleId,
      load: async (props: {} = {}) => this.invoke(item, load, props),
      timeout: defaultValue(options.timeout, DEFAULT.TIMEOUT),
      loadCount: 0,
      isLoaded: false,
    };
    this._modules = [...this._modules, item];

    // Finish up.
    this.fire({ type: 'LOADER/added', payload: { module: item } });
    return this;
  }

  public context<P extends object = any>(fn: t.LoaderContextUpdateProps<P>) {
    this._getContext = [...this._getContext, fn];
    return this;
  }

  public get<T = any>(moduleId?: string | number) {
    this.throwIfDisposed('get');
    const res =
      typeof moduleId === 'number'
        ? this.modules[moduleId]
        : this.modules.find(m => m.id === moduleId);
    return res ? (res as t.IDynamicModule<T>) : undefined;
  }

  public exists(moduleId: string | number) {
    this.throwIfDisposed('exists');
    return Boolean(this.get(moduleId));
  }

  public count(moduleId: string | number) {
    this.throwIfDisposed('count');
    const item = this.get(moduleId);
    return item ? item.loadCount : -1;
  }

  public isLoading(moduleId?: string | number) {
    const item = this.get(moduleId);
    const id = item ? item.id : undefined;
    const ids = this.loading;
    return moduleId === undefined ? ids.length > 0 : ids.some(item => item === id);
  }

  public isLoaded(moduleId: string | number) {
    this.throwIfDisposed('isLoaded');
    const item = this.get(moduleId);
    return item ? item.isLoaded : false;
  }

  public async load<T = any, P = {}>(
    moduleId: string | number,
    props?: P,
  ): Promise<t.LoadModuleResponse<T>> {
    this.throwIfDisposed('load');
    const item = this.get<T>(moduleId);
    return item
      ? item.load(props || {})
      : {
          ok: false,
          count: -1,
          error: new Error(`Module '${moduleId}' does not exist.`),
          timedOut: false,
        };
  }

  public async render<P = {}>(
    moduleId: string | number,
    props?: P,
  ): Promise<t.RenderModuleResponse> {
    this.throwIfDisposed('render');
    const res = await this.load<JSX.Element, P>(moduleId, props);

    // Convert [undefined] to [null].
    // NB:  This is safer for React as rendering `null` does nothing, whereas
    //      undefined throws an error.
    res.result = res.result === undefined ? (null as any) : res.result;

    // Update error state if nothing was rendered.
    if (res.result === undefined || (res.result === null && !res.error)) {
      res.error = new Error(`The module '${moduleId}' did not render a JSX element.`);
    }

    // Ensure the returned value is a React element.
    if (res.result && !React.isValidElement(res.result)) {
      res.error = new Error(`The module '${moduleId}' returned a result that was not JSX element.`);
    }

    // Finish up.
    const ok = !Boolean(res.error);
    const element = res.result as t.RenderModuleResponse['element'];
    const { count, error, timedOut } = res;
    return { ok, count, element, error, timedOut };
  }

  public getContextProps<P extends object = any>() {
    const props = {};
    const loader = this; // tslint:disable-line
    this._getContext.forEach(fn => fn({ loader, props }));
    return props as P;
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because Loader is disposed.`);
    }
  }

  private fire(e: t.LoaderEvents) {
    this._events$.next(e);
  }

  private async invoke(item: t.IDynamicModule, load: t.DynamicImport, props: {}) {
    if (!this.isLoading(item.id)) {
      this._loading = [...this._loading, item.id];
    }

    // Fire pre-event.
    const id = idUtil.shortid();
    item.loadCount++;
    const count = item.loadCount;
    this.fire({
      type: 'LOADER/loading',
      payload: { module: item.id, id, count },
    });

    // Invoke the load operation.
    const { result, error, timedOut } = await this.invokeOrTimeout(item, load, props);
    const ok = !Boolean(error);
    const response: t.LoadModuleResponse = {
      ok,
      count,
      result,
      error,
      timedOut,
    };

    // Finish up.
    item.isLoaded = true;
    this._loading = this._loading.filter(id => id !== item.id);
    this.fire({
      type: 'LOADER/loaded',
      payload: { module: item.id, id, count, result, error, timedOut },
    });
    return response;
  }

  private async invokeOrTimeout(item: t.IDynamicModule, load: t.DynamicImport, props: {}) {
    return new Promise<{ timedOut: boolean; error?: Error; result?: any }>(resolve => {
      const done = (args: { result?: any; error?: Error; timedOut?: boolean }) => {
        clearTimeout(timeout);
        const { result, error, timedOut = false } = args;
        resolve({ result, error, timedOut });
      };

      const timeout = setTimeout(() => {
        const error = new Error(`Loading '${item.id}' timed out.`);
        done({ error, timedOut: true });
      }, item.timeout);

      load(props)
        .then(result => done({ result }))
        .catch(error => done({ error }));
    });
  }
}
