import * as t from './types';
import { Key, state } from '../common';
import * as reducers from './reducers';

/**
 * Initializes a new store instance for managing a conversation thread.
 */
export function create(args: { initial: t.IThreadStoreModel; keys?: Key }) {
  const { initial } = args;
  const keys = args.keys || new Key({});
  const store = state.create<t.IThreadStoreModel, t.ThreadEvent>({ initial });
  reducers.init({ store, keys });
  return store;
}
