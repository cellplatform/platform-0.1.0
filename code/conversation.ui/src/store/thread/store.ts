import * as t from './types';
import { state } from '../common';
import * as reducers from './reducers';

const initial: t.IThreadModel = { items: [] };

/**
 * Initializes a new store instance for managing a conversation thread.
 */
export function create() {
  const store = state.create<t.IThreadModel, t.ThreadEvent>({ initial });
  reducers.init(store);

  return store;
}
