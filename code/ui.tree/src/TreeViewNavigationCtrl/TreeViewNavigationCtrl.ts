import { StateObject } from '@platform/state';
import { Observable } from 'rxjs';

import { defaultValue, t } from '../common';
import * as behavior from './behavior';

export type TreeViewNavigationCtrlArgs = {
  treeview$: Observable<t.TreeViewEvent>;
  tree: t.ITreeState;
  dispose$?: Observable<any>;
};

type Stores = {
  nav: t.IStateObjectWritable<t.ITreeViewNavigationSelection>;
  tree: t.ITreeState;
  merged: t.StateMerger<t.ITreeViewNavigationState>;
};

/**
 * Keeps a state object in sync with navigation changes.
 */
export class TreeViewNavigationCtrl implements t.ITreeViewNavigationCtrl {
  /**
   * [Lifecycle]
   */
  public static create(args: TreeViewNavigationCtrlArgs): t.ITreeViewNavigationCtrl {
    return new TreeViewNavigationCtrl(args);
  }
  private constructor(args: TreeViewNavigationCtrlArgs) {
    const { tree, treeview$ } = args;
    const nav = StateObject.create<t.ITreeViewNavigationSelection>({ current: tree.id });
    const merged = StateObject.merge<t.ITreeViewNavigationState>({ root: tree.store, nav });
    this.stores = { tree, nav, merged };
    behavior.listen({ ctrl: this, treeview$ });
    if (args.dispose$) {
      args.dispose$.subscribe(() => this.dispose());
    }
  }

  public dispose() {
    this.merged.dispose();
  }

  /**
   * [Fields]
   */
  private readonly stores: Stores;

  /**
   * [Properties]
   */
  private get merged() {
    return this.stores.merged;
  }

  public get store() {
    return this.merged.store;
  }

  private get state() {
    return this.store.state;
  }

  public get isDisposed() {
    return this.merged.store.isDisposed;
  }

  public get dispose$() {
    return this.merged.store.event.dispose$;
  }

  public get changed$() {
    return this.merged.changed$;
  }

  public get root() {
    return this.state.root;
  }

  public get current() {
    return this.state.nav.current;
  }

  public get selected() {
    return this.state.nav.selected;
  }

  /**
   * [Methods]
   */
  public change = (args: { current?: string; selected?: string }) => {
    const { current, selected } = args;
    this.stores.nav.change((draft) => {
      draft.current = current;
      draft.selected = selected;
    });
    return this;
  };

  public patch = (args: { current?: string; selected?: string }) => {
    const current = defaultValue(args.current, this.current);
    const selected = defaultValue(args.selected, this.selected);
    return this.change({ current, selected });
  };
}
