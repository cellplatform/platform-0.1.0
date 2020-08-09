import { Observable, Subject } from 'rxjs';

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
  treeview$: Subject<t.TreeviewEvent>;
  tree?: t.ITreeState<any>;
  dispose$?: Observable<any>;
  strategy?: t.TreeViewNavigationStrategy;
};

/**
 * Keeps a state object in sync with navigation changes.
 */
export type ITreeViewNavigation = t.IDisposable & {
  readonly id: string;
  readonly changed$: Observable<t.ITreeViewNavigationChanged>;
  readonly treeview$: Subject<t.TreeviewEvent>;
  readonly redraw$: Observable<void>;
  readonly selection$: Observable<ITreeViewNavigationSelection>;
  readonly query: t.ITreeQuery<t.ITreeviewNode>;
  readonly root: t.ITreeviewNode;
  tree: t.ITreeState;
  current?: string; //  Node ID.
  selected?: string; // Node ID.
  node(id?: t.NodeIdentifier, change?: TreeViewNavigationNodeChanger): t.ITreeNode | undefined;
  select(
    id?: t.NodeIdentifier,
    options?: { throw?: boolean; current?: true | t.NodeIdentifier },
  ): ITreeViewNavigation;
};

export type TreeViewNavigationNodeChanger = t.TreeStateChanger<
  t.ITreeviewNode,
  t.ITreeviewNodeProps
>;

/**
 * Navigation properties
 */
export type ITreeViewNavigationState = {
  root: t.ITreeviewNode;
  nav: ITreeViewNavigationSelection;
};
export type ITreeViewNavigationSelection = {
  current?: string; //  Node ID.
  selected?: string; // Node ID.
};

/**
 * Mutation
 */
type M = ITreeviewNavigationMutation;
export type ITreeviewNavigationMutation = {
  current(id?: string): M;
  color(id?: string, color?: string | number): M;
  selected(id?: string): M;
  toggleOpen(id?: string): M;
};
