import { equals } from 'ramda';
import { Subject } from 'rxjs';
import { distinctUntilChanged, share, takeUntil } from 'rxjs/operators';

import * as t from '../types';
import {
  IWindowChange,
  IWindowChangedEvent,
  IWindows,
  IWindowsGetEvent,
  IWindowsGetResponse,
  IWindowsState,
  IWindowTag,
} from './types';

/**
 * [renderer] Maintains a set of reference to all windows.
 */
export class WindowsRenderer implements IWindows {
  private ipc: t.IpcInternal;
  private _state: IWindowsState = { refs: [], focused: undefined };

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());
  public isDisposed = false;

  private readonly _change$ = new Subject<IWindowChange>();
  public readonly change$ = this._change$.pipe(
    takeUntil(this.dispose$),
    distinctUntilChanged((prev, next) => equals(prev, next)),
    share(),
  );

  /**
   * [Constructor]
   */
  constructor(args: { ipc: t.IpcClient }) {
    const ipc = (this.ipc = args.ipc);
    ipc
      .on<IWindowChangedEvent>('@platform/WINDOWS/change')
      .pipe(takeUntil(this.dispose$))
      .subscribe(e => {
        const { type, state, windowId } = e.payload;
        this.change(type, windowId, state);
      });

    this.refresh();
  }

  /**
   * [Properties]
   */
  public get refs() {
    return this._state.refs;
  }

  public get focused() {
    return this._state.focused;
  }

  /**
   * [Methods]
   */
  public async refresh() {
    type E = IWindowsGetEvent;
    type R = IWindowsGetResponse;
    const res = this.ipc.send<E, R>('@platform/WINDOWS/get', {}, { target: this.ipc.MAIN });
    await res.promise;
    const remoteState = res.dataFrom('MAIN');

    if (remoteState) {
      const isRefsChanges = !equals(remoteState.refs, this.refs);
      const isFocusedChanged = !equals(remoteState.focused, this.focused);

      if (isFocusedChanged) {
        const focusedWindowId = remoteState.focused ? remoteState.focused.id : undefined;
        this.change('FOCUS', focusedWindowId, remoteState);
      }

      if (isRefsChanges) {
        const localWindows = [...this.refs];
        const remoteWindows = [...remoteState.refs];

        // Check for new windows that do not exist locally.
        for (const window of remoteWindows) {
          const existLocally = localWindows.find(m => m.id === window.id);
          if (!existLocally) {
            this.change('CREATED', window.id, remoteState);
          }
        }

        // Check for windows that exist locally that have been closed.
        for (const window of localWindows) {
          const existsRemotely = remoteWindows.find(m => m.id === window.id);
          if (!existsRemotely) {
            this.change('CLOSED', window.id, remoteState);
          }
        }
      }
    }
  }

  /**
   * Applies [1..n] tags to a window.
   */
  public async tag(id: number, ...tag: IWindowTag[]) {
    console.log(`\nTODO 🐷 assign tag to window via event to MAIN  \n`);
  }

  /**
   * Convert to simple state object.
   */
  public toObject() {
    return { ...this._state };
  }

  /**
   * [INTERNAL]
   */
  private change(type: IWindowChange['type'], windowId: number | undefined, state: IWindowsState) {
    this._state = { ...state };
    this._change$.next({ type, windowId, state });
  }
}
