import * as t from './types';
import { state } from '../common';
import * as reducers from './reducers';

/**
 * Initializes a new store instance for managing a conversation thread.
 */
export function create(args: { user: t.IThreadUser }) {
  const { user } = args;
  const initial: t.IThreadModel = { items: [], draft: { user } };
  const store = state.create<t.IThreadModel, t.ThreadEvent>({ initial });
  reducers.init(store);

  return store;
}
