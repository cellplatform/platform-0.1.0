import { IState, IAction, StoreInternal } from '../common';

/**
 * Implementation of the `remove` method on a store.
 */
export function remove(
  store: StoreInternal<IState, IAction>,
  path: string,
  options: { key?: string } = {},
) {
  const { key } = options;
  return key ? removeDictionaryChild(store, path, key) : removeChild(store, path);
}

/**
 * INTERNAL
 */
function removeChild(store: StoreInternal<IState, IAction>, path: string) {
  const { children } = store.data;
  const index = children.findIndex(item => item.path === path);
  const exists = index > -1;
  if (exists) {
    store.data.children = [...children.slice(index, 0), ...children.splice(index + 1)];
  }
  return exists;
}

function removeDictionaryChild(store: StoreInternal<IState, IAction>, path: string, key: string) {
  let deleted = 0;
  const { childDictionaries: dicts } = store.data;
  const dict = dicts.find(item => item.path === path);

  if (dict) {
    const index = dict.items.findIndex(item => item.path === key);
    const exists = index > -1;
    if (exists) {
      dict.items = [...dict.items.slice(index, 0), ...dict.items.slice(index + 1)];
      deleted++;
    }
  }

  // Finish up.
  return deleted > 0;
}
