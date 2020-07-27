import { StateObject } from '@platform/state/lib/StateObject';
import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { TreeState } from '@platform/state/lib/TreeState';
import { Observable, Subject } from 'rxjs';
import { debounceTime, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { strategies } from '../TreeViewNavigation.Strategies';

type Stores = {
  nav: t.IStateObjectWritable<t.ITreeViewNavigationSelection>;
  tree: t.ITreeState;
  merged: t.StateMerger<t.ITreeViewNavigationState>;
};

/**
 * Controller that keeps a state object in sync with navigation changes.
 */
export class TreeViewNavigation implements t.ITreeViewNavigation {
  public static strategies = strategies;
  public static identity = TreeState.identity;
  public static props = TreeState.props;
  public static children = TreeState.children;

  /**
   * [Lifecycle]
   */
  public static create(args: t.ITreeViewNavigationArgs): t.ITreeViewNavigation {
    return new TreeViewNavigation(args);
  }
  private constructor(args: t.ITreeViewNavigationArgs) {
    const { tree } = args;
    this.treeview$ = args.treeview$;

    // Setup state objects.
    const nav = StateObject.create<t.ITreeViewNavigationSelection>({ current: tree.id });
    const merged = StateObject.merge<t.ITreeViewNavigationState>({ root: tree.store, nav });
    this.stores = { tree, nav, merged };

    if (args.dispose$) {
      args.dispose$.subscribe(() => this.dispose());
    }

    if (args.strategy) {
      args.strategy(this);
    }

    this.changed$.pipe(takeUntil(this.dispose$), debounceTime(10)).subscribe(this.redraw);
  }

  public dispose() {
    this.stores.merged.dispose();
  }

  /**
   * [Fields]
   */
  private readonly stores: Stores;
  public readonly treeview$: Observable<t.TreeViewEvent>;

  private _redraw = new Subject<void>();
  public readonly redraw$ = this._redraw.pipe(share());

  /**
   * PRIVATE Properties
   */
  private get store() {
    return this.stores.merged.store;
  }

  private get state() {
    return this.store.state;
  }

  /**
   * PUBLIC Properties
   */
  public get isDisposed() {
    return this.store.isDisposed;
  }

  public get dispose$() {
    return this.store.event.dispose$;
  }

  public get changed$() {
    return this.store.event.changed$;
  }

  public get root() {
    return this.state.root;
  }

  public get current() {
    return this.state.nav.current;
  }
  public set current(value: string | undefined) {
    this.stores.nav.change((draft) => (draft.current = value));
  }

  public get selected() {
    return this.state.nav.selected;
  }
  public set selected(value: string | undefined) {
    this.stores.nav.change((draft) => (draft.selected = value));
  }

  public get query() {
    const root = this.root;
    return TreeQuery.create({ root });
  }

  /**
   * [Methods]
   */

  public node: t.ITreeViewNavigation['node'] = (id, change) => {
    if (id && typeof change === 'function') {
      const tree = this.stores.tree;
      tree.change((draft, ctx) => {
        const query = TreeQuery.create({ root: draft });
        const node = query.findById(id);
        if (node) {
          change(node, { ...ctx, ...query });
        }
      });
    }
    return id ? this.query.findById(id) : undefined;
  };

  /**
   * Helpers
   */
  private redraw = () => this._redraw.next();
}
