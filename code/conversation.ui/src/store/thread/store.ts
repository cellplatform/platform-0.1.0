import * as t from './types';
import { state } from '../common';
import * as reducers from './reducers';

/**
 * Initializes a new store instance for managing a conversation thread.
 */
export function create(args: { initial: t.IThreadModel }) {
  const { initial } = args;
  const store = state.create<t.IThreadModel, t.ThreadEvent>({ initial });
  reducers.init(store);

  return store;
}
