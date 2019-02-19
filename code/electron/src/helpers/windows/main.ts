import { app, BrowserWindow } from 'electron';
import { uniq } from 'ramda';
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
  IWindowsState,
  IWindowsTagEvent,
  IWindowTag,
  IWindowsVisibleEvent,
} from './types';
import * as util from './util';

export * from './types';

let uid = 0;

/**
 * [main] Maintains a set of reference to all windows.
 */
export class WindowsMain implements IWindows {
  public readonly uid = uid;
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
    uid++;
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
      return this.toObject() as IWindowsGetResponse;
    });

    /**
     * Handle tag requests from client windows.
     */
    ipc.handle<IWindowsTagEvent>('@platform/WINDOWS/tag', async e => {
      const { windowId, tags } = e.payload;
      this.tag(windowId, ...tags);
    });

    /**
     * Handle visibility requests from client windows.
     */
    ipc.handle<IWindowsVisibleEvent>('@platform/WINDOWS/visible', async e => {
      const { isVisible, windowId } = e.payload;
      this.visible(isVisible, ...windowId);
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
   * Convert to a simple [IWindowsState] object.
   */
  public toObject(): IWindowsState {
    const focused = this.focused ? { ...this.focused } : undefined;
    return { refs: [...this.refs], focused };
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
   * Filter windows on an given tag.
   */
  public byTag(tag: IWindowTag['tag'], value?: IWindowTag['value']): IWindowRef[];
  public byTag(...tags: IWindowTag[]): IWindowRef[];
  public byTag(): IWindowRef[] {
    return util.filterByTagWrangle(this.refs, Array.from(arguments));
  }

  /**
   * Filter by window-id.
   */
  public byId(...windowId: number[]) {
    return util.filterById(this.refs, windowId);
  }

  /**
   * Changes the visibility of all or the specified windows.
   */
  public visible(isVisible: boolean, ...windowId: number[]) {
    const all = BrowserWindow.getAllWindows();
    const refs = windowId.length === 0 ? this.refs : this.byId(...windowId);
    refs.forEach(ref => {
      const window = all.find(window => window.id === ref.id);
      if (window) {
        if (isVisible) {
          window.show();
        } else {
          window.hide();
        }
      }
    });
    return this;
  }

  /**
   * [INTERNAL]
   */
  private handleWindowCreated = (e: Electron.Event, window: BrowserWindow) => {
    const windowId = window.id;
    this._refs = [...this._refs, { id: windowId, tags: [], isVisible: false }];
    this.fireChange('CREATED', windowId);

    window.on('show', () => this.changeVisibility(windowId, true));
    window.on('hide', () => this.changeVisibility(windowId, false));
    window.on('closed', () => {
      this._refs = this.refs.filter(ref => ref.id !== windowId);
      this.fireChange('CLOSED', windowId);
    });
  };

  private changeVisibility = (windowId: number, isVisible: boolean) => {
    const index = this.refs.findIndex(ref => ref.id === windowId);
    const ref = this.refs[index];
    if (ref) {
      this._refs = [...this._refs];
      this._refs[index] = { ...ref, isVisible };
    }
    this.fireChange('VISIBILITY', windowId);
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
