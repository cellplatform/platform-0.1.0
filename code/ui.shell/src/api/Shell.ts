import { TreeView, TreeViewEvent } from '@platform/ui.tree';
import { Subject, timer } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { loader, t } from '../common';
import * as state from '../state';
import * as events from './events';

type IShellArgs = { loader: loader.ILoader };

/**
 * Primary API for the shell.
 */
export class Shell implements t.IShell {
  /**
   * [Lifecycle]
   */
  public static singleton = new Shell({ loader: loader.singleton });
  private constructor(args: IShellArgs) {
    this.loader = args.loader;
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  public readonly loader: loader.ILoader;
  public readonly state: t.IShellState = state.shell.create();
  public defaultModuleId: string;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.ShellEvent>();
  private readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );
  private _events: t.IShellEvents;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get events() {
    return this._events || (this._events = events.init(this.events$, this.dispose$));
  }

  public get progress() {
    const api = {
      start: (options: { duration?: number } = {}) => {
        return new Promise<{}>(resolve => {
          const { duration = 1000 } = options;
          timer(duration)
            .pipe(takeUntil(this.events.progress.complete$))
            .subscribe(e => {
              api.complete();
              resolve({});
            });
          this.fire({ type: 'SHELL/progress/start', payload: { duration } });
        });
      },
      complete: () => this.fire({ type: 'SHELL/progress/complete', payload: {} }),
    };
    return api;
  }

  /**
   * [Methods]
   */
  public register = (
    moduleId: string,
    importer: t.ShellImporter,
    options?: { timeout?: number },
  ) => {
    this.throwIfDisposed('register');
    this.loader.add(moduleId, importer, options);
    return this;
  };

  public default(moduleId: string) {
    this.throwIfDisposed('default');
    this.defaultModuleId = moduleId;
    return this;
  }

  public async load<P = {}>(moduleId: string | number, props?: P) {
    this.throwIfDisposed('load');

    // Load the module.
    const res = await this.loader.load<t.ShellImporterResponse>(moduleId, props);

    // Initialize the loaded module.
    if (res.ok && res.result) {
      if (!(typeof res.result.init === 'function')) {
        res.ok = false;
        res.error = new Error(`The module '${moduleId}' does not have an [init] function`);
      } else {
        const shell = this; // tslint:disable-line
        const args: t.ShellImportInitArgs = { shell };
        await res.result.init(args);
      }
    }

    // Finish up.
    const { ok, count, error, timedOut } = res;
    return { ok, count, error, timedOut };
  }

  /**
   * [Internal]
   */
  public fire(e: t.ShellEvent) {
    this._events$.next(e);
  }

  /**
   * [Helpers]
   */

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because Shell is disposed.`);
    }
  }
}
