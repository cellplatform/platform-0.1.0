import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';

type Button = t.MouseEvent['button'];
type Target = t.TreeNodeMouseTarget;

/**
 * Helpers for filtering different event streams for a tree with sensible defaults.
 */
export class TreeEvents<N extends t.ITreeNode = any> implements t.ITreeEvents<N> {
  /**
   * [Lifecycle]
   */
  constructor(events$: Observable<t.TreeViewEvent>, dispose$?: Observable<{}>) {
    this.events$ = events$.pipe(takeUntil(this.dispose$));
    if (dispose$) {
      dispose$.subscribe(() => this.dispose());
    }
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  public readonly events$: Observable<t.TreeViewEvent>;
  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */
  public mouse$ = (
    options: { button?: Button[]; type?: t.MouseEventType; target?: Target } = {},
  ) => {
    const { type, target } = options;
    const buttons: Button[] = Array.isArray(options.button) ? options.button : ['LEFT'];
    return this.events$.pipe(
      filter(e => e.type === 'TREEVIEW/mouse'),
      map(e => e.payload as t.TreeNodeMouseEvent<N>),
      filter(e => (type ? e.type === type : true)),
      filter(e => buttons.includes(e.button)),
      filter(e => (target ? e.target === target : true)),
    );
  };

  public mouse(options: { button?: Button[] } = {}) {
    const { button } = options;
    const mouse$ = this.mouse$;
    const targets = (type: t.MouseEventType) => {
      const args = { button, type };
      return {
        get all$() {
          return mouse$({ ...args });
        },
        get node$() {
          return mouse$({ ...args, target: 'NODE' });
        },
        get drillIn$() {
          return mouse$({ ...args, target: 'DRILL_IN' });
        },
        get parent$() {
          return mouse$({ ...args, target: 'PARENT' });
        },
        get twisty$() {
          return mouse$({ ...args, target: 'TWISTY' });
        },
      };
    };
    return {
      get click() {
        return targets('CLICK');
      },
      get dblclick() {
        return targets('DOUBLE_CLICK');
      },
      get down() {
        return targets('DOWN');
      },
      get up() {
        return targets('UP');
      },
      get enter() {
        return targets('ENTER');
      },
      get leave() {
        return targets('LEAVE');
      },
    };
  }
}
