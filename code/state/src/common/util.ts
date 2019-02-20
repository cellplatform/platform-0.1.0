import { IStore, IState, IAction, StoreInternal } from '../common';

/**
 * Walks the store hierarchy top-down invoking the given function.
 */
export function topDown(
  level: StoreInternal<IState, IAction>,
  fn: (level: StoreInternal<IState, IAction>, levelIndex: number, dictKey?: string) => void,
  levelIndex = 0,
  dictKey?: string,
) {
  // Invoke current level.
  fn(level, levelIndex, dictKey);

  // Invoke children.
  level.data.children.forEach(
    child => topDown(child.store, fn, levelIndex + 1, child.path), // <== RECURSION.
  );

  // Invoke child dictionaries.
  level.data.childDictionaries.forEach(item => {
    item.items.forEach(child => {
      const key = `${item.path}.${child.path}`;
      topDown(child.store, fn, levelIndex + 1, key); // <== RECURSION.
    });
  });
}

/**
 * Walks up the tree building a store key.
 */
export function buildStoreKey(key: string, parent?: IStore<IState, IAction>) {
  const store = parent as StoreInternal<IState, IAction>;
  if (store) {
    if (store.data.key) {
      key = `${store.data.key}.${key}`;
    }
    key = buildStoreKey(key, store.data.parent); // <== RECURSION.
  }
  return key;
}
