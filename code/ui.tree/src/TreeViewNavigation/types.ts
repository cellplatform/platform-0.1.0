import { Observable } from 'rxjs';

import * as t from '../common/types';
import { TreeViewState } from '../TreeViewState/types';

export type TreeViewNavigation = {
  create(args: ITreeViewNavigationArgs): ITreeViewNavigation;
  strategies: t.TreeViewNavigationStrategies;

  identity: TreeViewState['identity'];
  children: TreeViewState['children'];
  props: TreeViewState['props'];
};

export type ITreeViewNavigationArgs = {
  treeview$: Observable<t.TreeViewEvent>;
  tree?: t.ITreeState<any>;
  dispose$?: Observable<any>;
  strategy?: t.TreeViewNavigationStrategy;
};

/**
 * Keeps a state object in sync with navigation changes.
 */
export type ITreeViewNavigation = t.IDisposable & {
  readonly changed$: Observable<t.ITreeViewNavigationChanged>;
  readonly treeview$: Observable<t.TreeViewEvent>;
  readonly redraw$: Observable<void>;
  readonly selection$: Observable<ITreeViewNavigationSelection>;
  readonly query: t.ITreeQuery<t.ITreeViewNode>;
  readonly root: t.ITreeViewNode;
  tree: t.ITreeState;
  current?: string; //  Node ID.
  selected?: string; // Node ID.
  node(id?: t.NodeIdentifier, change?: TreeViewNavigationNodeChanger): t.ITreeNode | undefined;
  select(id?: string): void;
};

export type TreeViewNavigationNodeChanger = t.TreeStateChanger<
  t.ITreeViewNode,
  t.ITreeViewNodeProps
>;

/**
 * Navigation properties
 */
export type ITreeViewNavigationState = {
  root: t.ITreeViewNode;
  nav: ITreeViewNavigationSelection;
};
export type ITreeViewNavigationSelection = {
  current?: string; //  Node ID.
  selected?: string; // Node ID.
};
