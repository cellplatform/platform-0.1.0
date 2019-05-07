import * as t from './types';
import { state } from '../common';
import * as reducers from './reducers';

/**
 * Initializes a new store instance for managing a conversation thread.
 */
export function create(args: { initial: t.IThreadStoreModel }) {
  const { initial } = args;
  const store = state.create<t.IThreadStoreModel, t.ThreadEvent>({ initial });
  reducers.init(store);

  return store;
}
