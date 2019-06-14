import { BrowserWindow } from 'electron';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

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
    type: string;
    window: BrowserWindow;
    events$: Observable<t.ScreenEvent>;
  }) {
    const { ctx, window } = args;
    this.type = args.type;
    this.window = window;
    this.id = window.id;
    args.events$.subscribe(this._events$);

    this.log = ctx.log;
    this.settings = ctx.settings;
    this.ipc = ctx.ipc;
    this.windows = ctx.windows;

    this.change$.pipe(filter(e => e.type === 'CLOSED')).subscribe(e => {
      this.dispose();
    });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  public readonly id: number;
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
}
