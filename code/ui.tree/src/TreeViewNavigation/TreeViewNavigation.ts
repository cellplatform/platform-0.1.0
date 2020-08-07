import { StateObject } from '@platform/state/lib/StateObject';
import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { TreeState } from '@platform/state/lib/TreeState';
import { Observable, Subject } from 'rxjs';
import { debounceTime, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { TreeUtil } from '../TreeUtil';
import { strategies } from '../TreeViewNavigation.Strategies';
import { TreeViewState } from '../TreeViewState';

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
  public static props = TreeUtil.props;
  public static children = TreeState.children;

  /**
   * [Lifecycle]
   */
  public static create(args: t.ITreeViewNavigationArgs): t.ITreeViewNavigation {
    return new TreeViewNavigation(args);
  }
  private constructor(args: t.ITreeViewNavigationArgs) {
    this.treeview$ = args.treeview$;
    const dispose$ = this.dispose$;
    const tree = args.tree || TreeViewState.create({ root: 'root', dispose$ });

    // Setup state objects.
    const nav = StateObject.create<t.ITreeViewNavigationSelection>({ current: tree.id });
    const merged = StateObject.merge<t.ITreeViewNavigationState>({ root: tree.store, nav });
    this.stores = { tree, nav, merged };

    // Initialize strategy.
    if (args.strategy) {
      args.strategy(this);
    }

    // Redraw on change.
    this.changed$.pipe(takeUntil(dispose$), debounceTime(10)).subscribe(this.redraw);

    // Selection change.
    nav.event.changed$.pipe(takeUntil(dispose$)).subscribe((e) => {
      this._selection.next({
        current: this.current,
        selected: this.selected,
      });
    });

    tree.event.changed$.subscribe((e) => {
      if (e.patches.next.some((patch) => patch.path.includes('children'))) {
        this.ensureSelection();
      }
    });

    // Manage disposal.
    args.dispose$?.subscribe(() => this.dispose());
    dispose$.subscribe(() => {
      this.stores.merged.dispose();
    });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly stores: Stores;
  public readonly treeview$: Observable<t.TreeviewEvent>;

  private _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private _redraw = new Subject<void>();
  public readonly redraw$ = this._redraw.pipe(share());

  private _selection = new Subject<t.ITreeViewNavigationSelection>();
  public readonly selection$ = this._selection.pipe(share());

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
    return this._dispose$.isStopped;
  }

  public get changed$() {
    return this.store.event.changed$;
  }

  public get tree() {
    return this.stores.tree;
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
      this.stores.tree.change((draft, ctx) => {
        const query = TreeQuery.create({ root: draft });
        const node = query.findById(id);
        if (node) {
          const props = TreeUtil.props;
          change(node, { ...ctx, ...query, props });
        }
      });
    }

    return id ? this.query.findById(id) : undefined;
  };

  public select: t.ITreeViewNavigation['select'] = (id, options = {}) => {
    const query = this.query;

    const selected = id ? query.findById(id) : undefined;
    if (id && !selected && options.throw !== false) {
      const err = `Cannot select node '${id}' as it does not exist within the tree.`;
      throw new Error(err);
    }

    this.stores.nav.change((draft) => {
      draft.selected = selected?.id;
      if (selected && options.current) {
        const current =
          options.current === true ? query.parent(selected) : query.findById(options.current);
        draft.current = current?.id;
      }
    });

    return this;
  };

  /**
   * Helpers
   */
  private redraw = () => this._redraw.next();

  private ensureSelection = () => {
    const query = this.query;
    if (this.selected) {
      const exists = query.findById(this.selected);
      if (!exists) {
        this.selected = undefined;
      }
    }

    if (this.current) {
      const exists = query.findById(this.current);
      if (!exists) {
        this.current = this.root.id;
      }
    }
    //
  };
}
