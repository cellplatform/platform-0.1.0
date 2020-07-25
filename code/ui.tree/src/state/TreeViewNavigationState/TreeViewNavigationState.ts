import { StateObject } from '@platform/state';
import { Observable } from 'rxjs';

import { defaultValue, t } from '../../common';
import * as treeEvents from './behavior.treeEvents';

export type ITreeNavControllerArgs = {
  treeview$: Observable<t.TreeViewEvent>;
  tree: t.ITreeState;
  dispose$?: Observable<any>;
};

type Store = {
  nav: t.IStateObjectWritable<t.ITreeViewNavigationSelection>;
  tree: t.ITreeState;
  merged: t.StateMerger<t.ITreeViewNavigationState>;
};

/**
 * Keeps a state object in sync with navigation changes.
 */
export class TreeViewNavigationState implements t.ITreeViewNavigationCtrl {
  /**
   * [Lifecycle]
   */
  public static create(args: ITreeNavControllerArgs): t.ITreeViewNavigationCtrl {
    return new TreeViewNavigationState(args);
  }
  private constructor(args: ITreeNavControllerArgs) {
    const { tree, treeview$ } = args;
    const nav = StateObject.create<t.ITreeViewNavigationSelection>({ current: tree.id });
    const merged = StateObject.merge<t.ITreeViewNavigationState>({ root: tree.store, nav });
    this._store = { tree, nav, merged };
    treeEvents.listen({ ctrl: this, treeview$ });
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
  private readonly _store: Store;

  /**
   * [Properties]
   */
  private get merged() {
    return this._store.merged;
  }

  private get state() {
    return this.merged.state;
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

  public get store() {
    return this.merged.store;
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
    this._store.nav.change((draft) => {
      draft.current = current;
      draft.selected = selected;
    });
    return this;
  };

  public patch = (args: { current?: string; selected?: string }) => {
    const current = defaultValue(args.current, this.current);
    const selected = defaultValue(args.selected, this.selected);
    this.change({ current, selected });
    return this;
  };
}
