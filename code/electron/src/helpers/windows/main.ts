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
  IWindowsState,
  IWindowsTagEvent,
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
     * Monitor window creation.
     */
    app.on('browser-window-created', this.handleWindowCreated);

    /**
     * Monitor change of focus.
     */
    app.on('browser-window-focus', this.handleFocusChanged);

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

    /**
     * Listen for tag requests from client windows.
     */
    ipc.handle<IWindowsTagEvent>('@platform/WINDOWS/tag', async e => {
      const { windowId, tags } = e.payload;
      this.tag(windowId, ...tags);
    });
  }

  /**
   * Disposes of the object and frees up references.
   */
  public dispose() {
    app.removeListener('browser-window-created', this.handleWindowCreated);
    app.removeListener('browser-window-focus', this.handleFocusChanged);
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
    this.fireChange('REFRESH');
  }

  /**
   * Applies [1..n] tags to a window.
   */
  public async tag(windowId: number, ...tags: IWindowTag[]) {
    const refs = [...this.refs];
    const index = refs.findIndex(window => window.id === windowId);

    // Apply the tag(s) to the window references.
    if (index > -1) {
      tags.forEach(tag => {
        const window = { ...refs[index] };
        const tags = uniq([...window.tags, tag]);
        refs[index] = { ...window, tags };
      });
    }

    // Finish up.
    this._refs = refs;
    this.fireChange('TAG', windowId);
  }

  /**
   * Convert to a simple [IWindowsState] object.
   */
  public toObject(): IWindowsState {
    const focused = this.focused ? { ...this.focused } : undefined;
    return { refs: [...this.refs], focused };
  }

  /**
   * [INTERNAL]
   */
  private handleWindowCreated = (e: Electron.Event, window: BrowserWindow) => {
    const windowId = window.id;
    this._refs = [...this._refs, { id: windowId, tags: [] }];
    this.fireChange('CREATED', windowId);
    window.on('close', () => {
      this._refs = this._refs.filter(ref => ref.id !== windowId);
      this.fireChange('CLOSED', windowId);
    });
  };

  private handleFocusChanged = (e: Electron.Event, window: BrowserWindow) => {
    this.fireChange('FOCUS', window.id);
  };

  private fireChange(type: IWindowChange['type'], windowId?: number) {
    if (!this.isDisposed) {
      const state = this.toObject();
      const payload: IWindowChange = { type, windowId, state };
      this._change$.next(payload);
    }
  }
}
