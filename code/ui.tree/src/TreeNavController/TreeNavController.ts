import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
} from 'rxjs/operators';
import { t } from '../common';
import { StateObject } from '../state';
import { TreeEvents } from '../TreeEvents';
import { createEvents } from './TreeNavController.events';
import { defaultValue } from '@platform/util.value/lib/value/value';
import { TreeQuery } from '../TreeQuery';

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
    this._treeState = args.state;
    this._navState = StateObject.create<t.ITreeNavControllerProps>({ current: undefined });
    const event = this.event;

    if (args.dispose$) {
      args.dispose$.subscribe(() => this.dispose());
    }

    const treeEvents = TreeEvents.create(args.treeview$, args.dispose$);

    event.change$.subscribe((e) => {
      const res = this._navState.change((draft) => {
        draft.current = e.current;
        draft.selected = e.selected;
      });
      if (res.patches.next.length > 0) {
        this.fireChanged();
      }
    });

    // treeEvents.

    /**
     * Left mouse button handlers.
     */
    const left = treeEvents.mouse({ button: ['LEFT'] });

    left.down.node$.subscribe((e) => this.patch({ selected: e.id }));
    left.down.parent$.subscribe((e) => this.patch({ current: this.getParentId(e.node) }));

    left.down.drillIn$.subscribe((e) => this.patch({ current: e.id }));
    left.down.twisty$
      .pipe(
        filter((e) => Boolean((e.props || {}).inline)),
        filter((e) => (e.children || []).length > 0),
      )
      .subscribe((e) => {
        console.log('open twisty');
        // this.patch({ current: e.id });
      });
    left.dblclick.node$
      .pipe(
        filter((e) => !(e.props || {}).inline),
        filter((e) => (e.children || []).length > 0),
      )
      .subscribe((e) => this.patch({ current: e.id }));
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _navState: t.IStateObjectWrite<t.ITreeNavControllerProps>;
  private readonly _treeState: t.ITreeState;

  private _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());
  public readonly event = createEvents(this._dispose$);

  /**
   * [Properties]
   */
  public get root() {
    return this._treeState.root;
  }

  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get current() {
    return this._navState.state.current;
  }

  public get selected() {
    return this._navState.state.selected;
  }

  private get query() {
    return TreeQuery.create(this.root);
  }

  /**
   * [Methods]
   */

  public change(args: { current?: string; selected?: string }) {
    const { current, selected } = args;
    this.fire({
      type: 'TreeNav/change',
      payload: { current, selected },
    });
    return this;
  }

  public patch(args: { current?: string; selected?: string }) {
    const current = defaultValue(args.current, this.current);
    const selected = defaultValue(args.selected, this.selected);
    this.change({ current, selected });
    return this;
  }

  /**
   * [Helpers]
   */

  private fire = (e: t.TreeNavEvent) => this.event.fire(e);

  private fireChanged = () => {
    const current = this.current;
    const selected = this.selected;
    const root = this.root;
    this.fire({ type: 'TreeNav/changed', payload: { current, selected, root } });
  };

  private getParent = (node: t.NodeIdentifier) => {
    return this.query.ancestor(node, (e) => e.level > 0 && !e.node.props?.inline);
  };

  private getParentId = (node: t.NodeIdentifier) => {
    const parent = this.getParent(node);
    return parent ? parent.id : undefined;
  };
}
