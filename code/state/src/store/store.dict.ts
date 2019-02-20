import {
  IState,
  IStore,
  IAction,
  StoreInternal,
  StoreFactory,
  value,
  IDictionaryStore,
  buildStoreKey,
} from '../common';

type Internal = StoreInternal<IState, IAction>;

/**
 * Implementation of the `dict` method on a store.
 */
export function dict(
  parent: StoreInternal<IState, IAction>,
  path: string,
  factory: StoreFactory<IState, IAction>,
) {
  if (parent.data.childDictionaries.findIndex(item => item.path === path) > -1) {
    throw new Error(`A child dictionary with key-path '${path}' has already been added.`);
  }

  // Store a reference to the child dictionary.
  const currentValue = value.object.pluck(path, parent.data.current);
  const item: IDictionaryStore = {
    path: path,
    factory,
    items: [],
    isPersistent: Boolean(currentValue),
  };
  parent.data.childDictionaries = [...parent.data.childDictionaries, item];
}

/**
 * Ensure the containing dictionary object exists on the given store.
 */
export function ensureDictionaryObject(path: string | undefined, store: IStore<IState, IAction>) {
  if (!path) {
    return;
  }

  const internal = store as Internal;
  let current = internal.data.current;

  // NB: `buildObject` used because the key is potentially a "deep" object path.
  current = value.object.build(path, current);
  internal.data.current = current;
}

/**
 * Creates a store for a key on a dictionary.
 */
export function createDictionaryStore(options: {
  def: IDictionaryStore;
  path: string;
  key: string;
  parent: IStore<IState, IAction>;
  initialState?: any;
}) {
  const { def, key, path, parent } = options;

  // Lookup initial state on parent store if not supplied.
  const initialState = options.initialState || value.object.pluck(`${path}.${key}`, parent.state);

  // Look for a matching child store that already exists on the dictionary.
  let child = def.items.find(item => item.path === key);

  if (!child) {
    // Create the child store on the dictionary.
    const store = def.factory({
      initial: initialState,
      path,
      key,
    }) as any;

    child = { path: key, store };
    def.items = [...def.items, child];

    // Mark the child store with a reference to the parent.
    const childStore = store as Internal;
    childStore.data.parent = parent as Internal;
    childStore.data.key = buildStoreKey(`${path}.${key}`, parent);
  }

  // Finish up.
  return child.store;
}
