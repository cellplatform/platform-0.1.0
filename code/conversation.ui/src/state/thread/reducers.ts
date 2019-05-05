import * as t from '../types';

export function init(store: t.IThreadStore) {
  store.on<t.IIncrementEvent>('TEST/increment').subscribe(e => {
    e.change({ ...e.state, count: e.state.count + 1 });
  });
}
