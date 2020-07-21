import { Observable, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { t } from '../common';
import { TreeEvents } from '../TreeEvents';

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
  public static create(args: ITreeNavControllerArgs) {
    return new TreeNavController(args);
  }
  private constructor(args: ITreeNavControllerArgs) {
    this.treeview$ = args.treeview$;
    this.state = args.state;
    const events = (this.events = TreeEvents.create(this.treeview$, this.dispose$));

    if (args.dispose$) {
      args.dispose$.subscribe(() => this.dispose());
    }

    events.event$.subscribe((e) => {
      console.log('e', e);
    });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly state: t.ITreeState;
  private readonly treeview$: Observable<t.TreeViewEvent>;
  private events: t.ITreeEvents;

  private _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }
}
