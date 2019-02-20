import { IStore, IState, IAction, StoreInternal, value } from '../common';

/**
 * Implementation of the `state` property on a store.
 */
export function getState(store: IStore<IState, IAction>, options: {} = {}) {
  let state = { ...asInternal(store).data.current };
  state = syncChildStores(store, state);
  return state;
}

/**
 * Writes data from children of the given store to the state object.
 */
export function syncChildStores(store: IStore<IState, IAction>, state: IState) {
  const data = asInternal(store).data;

  // Write child-store state.
  data.children.forEach(({ path, store }) => {
    state = value.object.build(path, state, { ...store.state });
  });

  // Write child-dictionary-store state.
  data.childDictionaries
    .filter(def => (def.items.length > 0 ? true : def.isPersistent))
    .forEach(({ path, items }) => {
      items.forEach(item => {
        const obj = { ...item.store.state };
        state = value.object.build(`${path}.${item.path}`, state, obj);
      });
    });

  return state;
}

/**
 * Removes items from the state tree that are no longer present
 * within child-dictionaries.
 */
// export function pruneChildDictionaries(
//   store: IStore<IState, IAction>,
//   state: IState,
// ) {
//   const data = asInternal(store).data;

//   data.childDictionaries.filter(def => def.items.length === 0).forEach(def => {
//     if (def.isPersistent) {
//       // Remove obsolete dictionary children,
//       // but do not remove the root dictionary object itself.
//       const dictObject = value.object.pluck(def.path, state);
//       const keys = Object.keys(dictObject);
//       keys.forEach(key => {
//         state = value.object.remove(`${def.path}.${key}`, state);
//       });
//     } else {
//       // Clear non-persistent dictionaries from the tree.
//       //    This means an empty root dictionary object will be deleted if it
//       //    was not already present at the time the dictionary was initialized.
//       state = value.object.prune(def.path, state);
//     }
//   });

//   return state;
// }

/**
 * INTERNAL
 */

function asInternal(store: IStore<IState, IAction>) {
  return store as StoreInternal<IState, IAction>;
}
