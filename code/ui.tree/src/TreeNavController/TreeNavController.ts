import { Observable, Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import { TreeEvents } from '../TreeEvents';

import { t, time } from '../common';
import { TreeNavControllerEvents } from './TreeNavControllerEvents';
import { StateObject } from '../state';

export type ITreeNavControllerArgs = {
  treeview$: Observable<t.TreeViewEvent>;
  state: t.ITreeState;
  dispose$?: Observable<any>;
};

/**
 * Keeps a state object in sync with navigation changes.
 */
export class TreeNavController implements t.ITreeNavController {
  /**
   * [Lifecycle]
   */
  public static create(args: ITreeNavControllerArgs): t.ITreeNavController {
    return new TreeNavController(args);
  }
  private constructor(args: ITreeNavControllerArgs) {
    this._treeview$ = args.treeview$;
    this._treeState = args.state;
    this._navState = StateObject.create<t.ITreeNavControllerState>({ current: undefined });

    const events = (this.events = TreeNavControllerEvents.create({
      treeview$: this._treeview$,
      dispose$: this.dispose$,
    }));

    if (args.dispose$) {
      args.dispose$.subscribe(() => this.dispose());
    }

    const treeEvents = TreeEvents.create(args.treeview$, args.dispose$);

    treeEvents.event$.subscribe((e) => {
      // console.log('TreeEvent (TreeView):', e);
    });

    // TEMP 🐷
    events.event$.subscribe((e) => {
      // console.log('TreeNavController :: e', e);
    });

    events.changed$.subscribe((e) =>
      this._navState.change((draft) => (draft.current = e.currrent)),
    );

    // events.

    time.delay(150, () => {
      this.events.fire({ type: 'TreeNav/changed', payload: { currrent: 'child-1' } }); // TEMP 🐷
    });

    const leftButton = treeEvents.mouse({ button: ['LEFT'] });

    leftButton.down.node$.subscribe((e) => {
      console.log('e', e);
      this.events.fire({
        type: 'TreeNav/changed',
        payload: { currrent: e.id },
      }); // TEMP 🐷
    });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _navState: t.IStateObjectWrite<t.ITreeNavControllerState>;
  private readonly _treeState: t.ITreeState;
  private readonly _treeview$: Observable<t.TreeViewEvent>;
  public readonly events: t.ITreeNavControllerEvents;

  private _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get current() {
    return this._navState.state.current;
  }

  /**
   * [Helpers]
   */
}
