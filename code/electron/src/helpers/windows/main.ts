import { uniq } from 'ramda';
import { app, BrowserWindow } from 'electron';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import * as t from '../types';
import {
  IWindowChange,
  IWindowChangedEvent,
  IWindowRef,
  IWindows,
  IWindowsGetEvent,
  IWindowsGetResponse,
  IWindowTag,
} from './types';

export * from './types';

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

    /**
     * Keep a record of current windows.
     */
    app.on('browser-window-created', this.handleWindowCreated);

    /**
     * Broadcast changes through IPC event.
     */
    this.change$.subscribe(change => {
      ipc.send<IWindowChangedEvent>('@platform/WINDOWS/change', change);
    });

    /**
     * Handle requests from windows for window information.
     */
    ipc.handle<IWindowsGetEvent>('@platform/WINDOWS/get', async e => {
      const res: IWindowsGetResponse = {
        refs: [...this.refs],
        focused: this.focused,
      };
      return res;
    });
  }

  /**
   * Disposes of the object and frees up references.
   */
  public dispose() {
    app.removeListener('browser-window-created', this.handleWindowCreated);
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

  public get focused() {
    const window = BrowserWindow.getFocusedWindow();
    return window ? this.refs.find(ref => ref.id === window.id) : undefined;
  }

  /**
   * [Methods]
   */
  public async refresh() {
    // No-op on main.
    console.log(`\nTODO 🐷   broadcast latest to all windows \n`);
  }

  /**
   * Applies [1..n] tags to a window.
   */
  public async tag(id: number, ...tag: IWindowTag[]) {
    const index = this.refs.findIndex(w => w.id === id);
    if (index > -1) {
      tag.forEach(tag => {
        const refs = [...this.refs];
        const window = { ...refs[index] };
        const tags = uniq([...window.tags, tag]);
        refs[index] = { ...window, tags };
        this._refs = refs;
        this.fireChange('TAG', window.id);
      });
    }
  }

  /**
   * Convert to simple state object.
   */
  public toObject() {
    return { refs: this.refs, focused: this.focused };
  }

  /**
   * [INTERNAL]
   */
  private handleWindowCreated = (e: Electron.Event, window: BrowserWindow) => {
    const id = window.id;
    this._refs = [...this._refs, { id, tags: [] }];
    this.fireChange('CREATED', id);
    window.on('close', () => {
      this._refs = this._refs.filter(ref => ref.id !== id);
      this.fireChange('CLOSED', id);
    });
  };

  private fireChange(type: IWindowChange['type'], windowId?: number) {
    if (!this.isDisposed) {
      const payload: IWindowChange = {
        type,
        windowId: windowId,
        state: {
          refs: [...this.refs],
          focused: this.focused,
        },
      };
      console.log('payload', payload);
      this._change$.next(payload);
    }
  }
}
