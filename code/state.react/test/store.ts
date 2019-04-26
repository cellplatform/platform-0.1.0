import { state, t, log } from './common';

export const store = state.create<t.IMyModel, t.MyEvent>({ initial: { count: 0 } });
export const Provider = state.createProvider(store);

/**
 * [Reducers]
 */

store
  // Increment the count.
  .on<t.IMyIncrementEvent>('TEST/increment')
  .subscribe(e => {
    const count = e.state.count + (e.payload.by || 1);
    const next = { ...e.state, count };
    e.change(next);
  });

store
  // Decrement the count.
  .on<t.IMyDecrementEvent>('TEST/decrement')
  .subscribe(e => {
    const count = e.state.count - (e.payload.by || 1);
    const next = { ...e.state, count };
    e.change(next);
  });

/**
 * Log events.
 */
store.events$.subscribe(e => {
  log.info('🌳 Event', e);
});

store.changed$.subscribe(e => {
  log.info('🐷 Changed', e);
});
