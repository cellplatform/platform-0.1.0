import { state, t, log } from './common';

export const store = state.create<t.IMyModel, t.MyEvent>({
  initial: {
    count: 0,
    debug: 'SINGLE',
  },
});

export const Provider = state.createProvider<t.IMyContextProps>(store, {
  foo: 123,
  getAsync: async () => true,
});

/**
 * [Reducers]
 */

store
  // Increment the count.
  .on<t.IMyIncrementEvent>('TEST/increment')
  .subscribe(e => {
    const count = e.state.count + (e.payload.by || 1);
    const next: t.IMyModel = { ...e.state, count };
    e.change(next);
  });

store
  // Decrement the count.
  .on<t.IMyDecrementEvent>('TEST/decrement')
  .subscribe(e => {
    const count = e.state.count - (e.payload.by || 1);
    const next: t.IMyModel = { ...e.state, count };
    e.change(next);
  });

store
  // Change the debug view.
  .on<t.IDebugEvent>('TEST/debug')
  .subscribe(e => {
    const { debug } = e.payload;
    const next: t.IMyModel = { ...e.state, debug };
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
