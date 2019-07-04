import { app, BrowserWindow } from 'electron';
import { uniq } from 'ramda';
import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import * as t from '../types';
import {
  IWindowChange,
  IWindowRef,
  IWindows,
  IWindowsGetEvent,
  IWindowsGetResponse,
  IWindowsState,
  IWindowsTagEvent,
  IWindowsVisibleEvent,
  IWindowTag,
  WindowsEvent,
} from './types';
import * as util from './util';

export * from './types';

let uid = 0;
let instance: WindowsMain | undefined;

/**
 * [main] Maintains a set of reference to all windows.
 */
export class WindowsMain implements IWindows {
  /**
   * [Static]
   */
  public static instance(args: { ipc: t.IpcClient }) {
    return instance || (instance = new WindowsMain(args));
  }

  /**
   * [Fields]
   */
  public readonly uid = uid;
  private _refs: IWindowRef[] = [];

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<WindowsEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  public readonly change$ = this.events$.pipe(
    filter(e => e.type === '@platform/WINDOW/change'),
    map(e => e.payload as IWindowChange),
    share(),
  );

  /**
   * [Constructor]
   */
  private constructor(args: { ipc: t.IpcClient }) {
    uid++;
    const ipc: t.IpcInternal = args.ipc;

    /**
     * Monitor window creation.
     */
    app.on('browser-window-created', this.handleWindowCreated);

    /**
     * Monitor change of focus.
     */
    app.on('browser-window-focus', this.handleFocus);
    app.on('browser-window-blur', this.handleBlur);

    /**
     * Broadcast events through the IPC channel.
     */
    const broadcast: Array<WindowsEvent['type']> = [
      '@platform/WINDOWS/refresh',
      '@platform/WINDOW/change',
    ];
    this.events$.pipe(filter(e => broadcast.includes(e.type))).subscribe(e => {
      ipc.send(e.type, e.payload);
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
    app.removeListener('browser-window-focus', this.handleFocus);
    app.removeListener('browser-window-blur', this.handleBlur);
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Properties]
   */

  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get refs() {
    const all = BrowserWindow.getAllWindows();
    return this._refs
      .map(ref => {
        try {
          const window = all.find(window => window.id === ref.id);
          const parent = window ? window.getParentWindow() : undefined;
          const children = window ? window.getChildWindows().map(window => window.id) : [];
          ref = parent ? { ...ref, parent: parent.id } : ref;
          return { ...ref, children };
        } catch (error) {
          // Ignore.
          // NB: May throw if trying to access a closed window.
          return undefined;
        }
      })
      .filter(ref => Boolean(ref)) as IWindowRef[];
  }

  public get ids() {
    return this._refs.map(ref => ref.id);
  }

  public get focused() {
    try {
      const window = BrowserWindow.getFocusedWindow();
      return window ? this.refs.find(ref => ref.id === window.id) : undefined;
    } catch (error) {
      // Ignore.
      // NB: This may throw if invoked while the application is shutting down.
      return undefined;
    }
  }

  /**
   * [Methods]
   */
  public async refresh() {
    this.fire({ type: '@platform/WINDOWS/refresh', payload: {} });
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
  public byIds(...windowId: number[]) {
    return util.filterById(this.refs, windowId);
  }

  /**
   * Find single by it's window-id.
   */
  public byId(windowId: number) {
    return this.byIds(windowId)[0];
  }

  /**
   * Changes the visibility of all or the specified windows.
   */
  public visible(isVisible: boolean, ...windowId: number[]) {
    const all = BrowserWindow.getAllWindows();
    const refs = windowId.length === 0 ? this.refs : this.byIds(...windowId);
    refs.forEach(ref => {
      try {
        const window = all.find(window => window.id === ref.id);
        if (window) {
          if (isVisible) {
            window.show();
          } else {
            window.hide();
          }
        }
      } catch (error) {
        // Ignore.
        // NB: May throw if trying to access a closed window.
      }
    });
    return this;
  }

  /**
   * [Internal]
   */
  private handleWindowCreated = (e: Electron.Event, window: BrowserWindow) => {
    const windowId = window.id;
    const ref: IWindowRef = { id: windowId, tags: [], children: [], isVisible: false };
    this._refs = [...this._refs, ref];
    this.fireChange('CREATED', ref);

    window.on('show', () => this.changeVisibility(windowId, true));
    window.on('hide', () => this.changeVisibility(windowId, false));
    window.once('closed', () => {
      const ref = this.refs.find(ref => ref.id === windowId);
      this._refs = this.refs.filter(ref => ref.id !== windowId);
      if (ref) {
        // NB: Do not fire the closed event if the app was quit.
        this.fireChange('CLOSED', ref);
      }
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

  private handleFocus = (e: Electron.Event, window: BrowserWindow) => {
    this.fireChange('FOCUS', window.id);
  };

  private handleBlur = (e: Electron.Event, window: BrowserWindow) => {
    this.fireChange('BLUR', window.id);
  };

  private fireChange(type: IWindowChange['type'], ref: IWindowRef | number) {
    if (!this.isDisposed) {
      const state = this.toObject();
      const window = typeof ref === 'object' ? ref : state.refs.find(({ id }) => id === ref);
      if (window) {
        const payload: IWindowChange = { type, window, state };
        this.fire({ type: '@platform/WINDOW/change', payload });
      }
    }
  }

  private fire(e: WindowsEvent) {
    this._events$.next(e);
  }
}
