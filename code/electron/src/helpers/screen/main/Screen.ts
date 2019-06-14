import { BrowserWindow } from 'electron';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil, delay } from 'rxjs/operators';

import { t } from './common';

/**
 * Represents a screen instance.
 */
export class Screen<M extends t.IpcMessage = any, S extends t.StoreJson = any>
  implements t.IScreen<M, S> {
  /**
   * [Lifecycle]
   */
  constructor(args: {
    ctx: t.IScreenContext<M, S>;
    uid: string;
    type: string;
    window: BrowserWindow;
    events$: Observable<t.ScreenEvent>;
  }) {
    const { ctx, window } = args;
    this.type = args.type;
    this.uid = args.uid;
    this.id = window.id;
    this.window = window;
    args.events$.subscribe(this._events$);

    this.log = ctx.log;
    this.settings = ctx.settings;
    this.ipc = ctx.ipc;
    this.windows = ctx.windows;

    this.close$
      // NB: Delay before disposing to allow other listeners on this observable to fire.
      .pipe(delay(0))
      .subscribe(e => this.dispose());
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private id: number; // Browser window ID.
  public readonly uid: string;
  public readonly type: string;
  public readonly window: BrowserWindow;

  // Context.
  public readonly log: t.ILog;
  public readonly settings: t.IStoreClient<S>;
  public readonly ipc: t.IpcClient<M>;
  public readonly windows: t.IWindows;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.ScreenEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    filter(e => e.payload.window.id === this.id),
    share(),
  );

  public readonly change$ = this.events$.pipe(
    filter(e => e.type === '@platform/SCREEN/window/change'),
    map(e => e.payload as t.IScreenChange),
    share(),
  );

  public readonly close$ = this.change$.pipe(
    filter(e => e.type === 'CLOSED'),
    share(),
  );

  /**
   * [Properties]
   */
  public get tags() {
    const ref = this.ref;
    return ref ? ref.tags : [];
  }

  private get ref() {
    return this.windows.byId(this.id)[0];
  }

  /**
   * [Methods]
   */
  public toString() {
    return `[Screen:${this.uid}(${this.id})]`;
  }
}
