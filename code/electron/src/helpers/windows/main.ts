import { app } from 'electron';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import * as t from '../types';

import {
  IWindowChange,
  IWindowRef,
  IWindowChangedEvent,
  IWindows,
  IWindowsGetEvent,
  IWindowsGetResponse,
} from './types';

/**
 * [main] Maintains a set of reference to all windows.
 */
export class WindowsMain implements IWindows {
  private _refs: IWindowRef[] = [];

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());
  public isDisposed = false;

  private readonly _change$ = new Subject<IWindowChange>();
  public readonly change$ = this._change$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Constructor]
   */
  constructor(args: { ipc: t.IpcClient }) {
    const ipc: t.IpcInternal = args.ipc;

    const fireChange = (
      type: IWindowChange['type'],
      id: number,
    ): IWindowChange => {
      const payload: IWindowChange = {
        type,
        window: id,
        windows: [...this.refs],
      };
      this._change$.next(payload);
      return payload;
    };

    /**
     * Keep a record of current windows.
     */
    app.on('browser-window-created', (e, window) => {
      const id = window.id;
      this._refs = [...this._refs, { id, tags: [] }];
      fireChange('CREATED', id);
      window.on('close', () => {
        this._refs = this._refs.filter(ref => ref.id !== id);
        fireChange('CLOSED', id);
      });
    });

    /**
     * Broadcast changes through IPC event.
     */
    this.change$.subscribe(change => {
      ipc.send<IWindowChangedEvent>('@platform/WINDOWS/change', {
        change,
      });
    });

    /**
     * Handle requests from windows for window information.
     */
    ipc.handle<IWindowsGetEvent>('@platform/WINDOWS/get', async e => {
      const res: IWindowsGetResponse = {
        windows: this.refs,
      };
      return res;
    });
  }

  /**
   * Disposes of the object and frees up references.
   */
  public dispose() {
    this.isDisposed = true;
    this._dispose$.next();
  }

  /**
   * [Properties]
   */
  public get refs() {
    return this._refs;
  }

  public get ids() {
    return this._refs.map(ref => ref.id);
  }

  /**
   * [Methods]
   */
  public tag(id: number, ...tag: string[]) {
    console.log('tag', id, tag);
  }

  public async refresh() {
    // No-op on main
  }

  /**
   * [INTERNAL]
   */

  //  public console.public log(`\nTODO 🐷   break out window event handlers as methods - and detach on dispose\n`)
}
