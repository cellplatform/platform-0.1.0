import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';

export type ITreeNavControllerEventsArgs = {
  treeview$: Observable<t.TreeViewEvent>;
  dispose$: Observable<any>;
};

/**
 * Event manager for a [Tree] nav-controller.
 */
export class TreeNavControllerEvents implements t.ITreeNavControllerEvents {
  /**
   * [Lifecycle]
   */
  public static create(args: ITreeNavControllerEventsArgs): t.ITreeNavControllerEvents {
    return new TreeNavControllerEvents(args);
  }
  private constructor(args: ITreeNavControllerEventsArgs) {
    args.dispose$.subscribe(() => this._dispose$.next());
    this.changed$ = this.payload<t.ITreeNavControllerChangedEvent>('TreeNav/changed');
  }

  /**
   * [Fields]
   */
  private readonly _dispose$ = new Subject();
  private readonly _event$ = new Subject<t.TreeNavEvent>();
  public readonly event$ = this._event$.pipe(takeUntil(this._dispose$));
  public readonly changed$: Observable<t.ITreeNavControllerChanged>;

  /**
   * [Methods]
   */
  public fire: t.FireEvent<t.TreeNavEvent> = (e) => this._event$.next(e);
  public payload: t.ITreeNavControllerEvents['payload'] = (type) =>
    rx.payload<any>(this.event$, type);
}
