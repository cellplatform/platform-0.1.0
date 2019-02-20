import { IState, IAction, IStore, StoreInternal, IDictionaryStore } from '../common';
import { createDictionaryStore } from './store.dict';

type Internal = StoreInternal<IState, IAction>;

/**
 * Implementation of the `get` method on a store.
 */
export function get<S extends IState, A extends IAction>(
  parent: StoreInternal<IState, IAction>,
  path: string | undefined,
  options: { key?: string; initialState?: S } = {},
) {
  // Setup initial conditions.
  const done = (result: any) => (result ? (result as IStore<S, A>) : undefined);
  if (!path) {
    return done(parent);
  }
  const parts = path.trim().split('.');
  const { key: field, initialState } = options;

  const get = (index: number, level: Internal, path: string): Internal | undefined => {
    const isLast = index === parts.length - 1;
    const levelKey = parts[index];

    const findDictChild = (key: string) =>
      level.data.childDictionaries.find(item => item.path === key);

    const findChild = (key: string) => level.data.children.find(item => item.path === key);

    const toDictionaryStore = (def: IDictionaryStore, key: string) => {
      return createDictionaryStore({
        def,
        key,
        path,
        parent,
        initialState,
      });
    };

    const dictFromPath = findDictChild(path);

    if (field && dictFromPath) {
      // Matched directly on current path.
      return toDictionaryStore(dictFromPath, field);
    } else if (field && isLast) {
      // Find the dictionary child at the current level.
      const dict = findDictChild(levelKey);
      return dict ? toDictionaryStore(dict, field) : undefined;
    } else {
      // Find regular child (store).
      // Check for a match on the direct path (deep).
      const pathChild = findChild(path);
      if (pathChild) {
        return pathChild.store; // Match.
      }

      // Check for match on the split path level.
      const levelChild = findChild(levelKey);
      if (!levelChild) {
        return undefined; // No match.
      }
      if (isLast) {
        return levelChild.store; // Match.
      }
      const key = (levelChild.store as Internal).data.key;
      return get(index + 1, levelChild.store, `${path}.${key}`); // <== RECURSION.
    }
  };

  // Start the recursive descent.
  const result = get(0, parent, path);
  return done(result);
}
