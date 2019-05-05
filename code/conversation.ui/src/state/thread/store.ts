import * as t from './types';
import { state } from '../common';
import * as reducers from './reducers';

const initial: t.IMyModel = { count: 0 };

/**
 * Initializes a new store instance for managing a conversation thread.
 */
export function create() {
  const store = state.create<t.IMyModel, t.MyEvent>({ initial });
  reducers.init(store);
  return store;
}
