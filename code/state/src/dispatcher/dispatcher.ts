import {
  topDown,
  Reducer,
  StoreContext,
  IState,
  IAction,
  StoreInternal,
  IDictionaryStore,
} from '../common';
import { ensureDictionaryObject } from '../store/store.dict';

export interface IReducerItem<S extends IState, A extends IAction> {
  reducer: Reducer<S, A>;
  actionType?: string;
}
export type IReducerItems<S extends IState, A extends IAction> = Array<IReducerItem<S, A>>;

type Internal = StoreInternal<IState, IAction>;

/**
 * Runs a set of reducers for a store.
 */
export function runReducers<S extends IState, A extends IAction>(
  reducers: IReducerItems<S, A>,
  localState: S,
  action: A,
  options: StoreContext,
) {
  let state: object = localState;
  let count = 0;

  // Run all reducers.
  reducers.forEach(item => {
    const { reducer, actionType } = item;
    if (actionType && action.type !== actionType) {
      // Don't invoke reducers that are scoped to a specific
      // action-type and don't match the current action.
      return;
    }
    const result = reducer(state as S, action, options);
    if (result) {
      state = result;
    }
    count++;
  });

  // Finish up.
  return count > 0 ? (state as S) : undefined;
}

/**
 * Runs all reducers in the hierarchy.
 */
export function runReducerHierarchy<S extends IState, A extends IAction>(
  store: StoreInternal<S, A>,
  action: A,
  options: StoreContext,
) {
  type Result = {
    levelIndex: number;
    dictKey?: string;
    stateBefore?: IState;
    stateAfter?: IState;
    store: StoreInternal<any, any>;
  };
  let results: Result[] = [];
  options = { ...options, name: options.name || store.name };

  // Run all reducers within the hierarchy.
  topDown(store, (level, levelIndex, dictKey) => {
    const stateBefore = level.state;

    // Invoke reducers on this level of the store.
    const context = { ...options, key: dictKey };
    const stateAfter = runReducers(level.data.reducers, stateBefore, action, context);

    // Store result for publishing after the entire hierarchy has been run.
    results = [
      ...results,
      {
        levelIndex,
        dictKey,
        stateBefore,
        stateAfter,
        store: level,
      },
    ];

    // Update child stores with new parent state.
    if (stateAfter) {
      store.data.children.forEach(child => {
        const current = stateAfter[child.path];
        if (current) {
          child.store.data.current = current;
        }
      });

      store.data.childDictionaries.forEach(dict => {
        dict.items.forEach(item => {
          const obj = stateAfter[dict.path];
          const current = obj && obj[item.path];
          if (current) {
            item.store.data.current = current;
          }
        });
      });

      store.data.childDictionaries.forEach(dict => {
        addOrRemoveChildDictionaryKeys(store, stateBefore, stateAfter, dict);
      });
    }
  });

  const hasChildLevelChanged = (level: number) =>
    results.findIndex(({ levelIndex, stateAfter }) => levelIndex > level && Boolean(stateAfter)) >
    -1;

  const shouldAlertListener = ({ levelIndex, stateAfter }: Result) => {
    const hasChanged = Boolean(stateAfter);
    return hasChanged || hasChildLevelChanged(levelIndex);
  };

  results
    // Store the new state on each level's store.
    .forEach(item => {
      const { store, stateBefore, stateAfter } = item;
      store.data.current = (stateAfter as S) || stateBefore;
    });

  results
    // Store the new state value and alert listeners.
    .filter(item => shouldAlertListener(item))
    .forEach(item => {
      const { store } = item;
      const { type, payload } = action;
      const state = store.state; // NB: Called here via property so that child hierarchy is created.
      store.data.state$.next({ type, state, action, payload, options });
    });
}

function addOrRemoveChildDictionaryKeys(
  store: Internal,
  stateBefore: IState,
  stateAfter: IState,
  dict: IDictionaryStore,
) {
  const path = dict.path;

  ensureDictionaryObject(path, store);

  type ChildDictState = { [key: string]: any };
  const before = stateBefore ? (stateBefore[path] as ChildDictState) : undefined;
  const after = stateAfter ? (stateAfter[path] as ChildDictState) : undefined;

  if (!after || !before) {
    return;
  }

  const addedKeys = Object.keys(after).filter(k => !before[k]);
  const removedKeys = Object.keys(before).filter(k => !after[k]);

  // For each newly added key, ensure it is created in the child store.
  addedKeys.forEach(key => {
    store.get(path, {
      key,
      initialState: after[key],
    });
  });

  // For each removed key, shut down the child store.
  removedKeys.forEach(key => {
    dict.items = dict.items.filter(item => item.path !== key);
  });
}
