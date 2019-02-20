import { IState, IAction, IStore, StoreInternal, buildStoreKey } from '../common';

type Internal = StoreInternal<IState, IAction>;

/**
 * Implementation of the `add` method on a store.
 */
export function add(
  parent: StoreInternal<IState, IAction>,
  path: string,
  store: IStore<IState, IAction>,
) {
  // Setup initial conditions.
  const { children } = parent.data;
  if (children.findIndex(item => item.path === path) > -1) {
    throw new Error(`A child store with key-path '${path}' has already been added.`);
  }

  // Mark the child store with a reference to the parent.
  const childStore = store as Internal;
  childStore.data.parent = parent;
  childStore.data.key = buildStoreKey(path, childStore);

  // Store a reference to the child store.
  parent.data.children = [...children, { path: path, store: childStore }];
}
