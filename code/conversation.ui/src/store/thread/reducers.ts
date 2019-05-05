import * as t from '../types';

export function init(store: t.IThreadStore) {
  store
    // Insert a new item into the thread.
    .on<t.IAddThreadItemEvent>('THREAD/add')
    .subscribe(e => {
      const state = e.state;
      const items = [...state.items, e.payload.item];
      const draft = { ...state.draft };
      delete draft.markdown;
      e.change({ ...state, items, draft });
    });

  store
    // Update the thread-items list.
    .on<t.IThreadItemsEvent>('THREAD/items')
    .subscribe(e => {
      const state = e.state;
      const items = e.payload.items;
      e.change({ ...state, items });
    });

  store
    // Update the draft
    .on<t.IThreadDraftEvent>('THREAD/draft')
    .subscribe(e => {
      const state = e.state;
      const draft = e.payload.draft;
      e.change({ ...state, draft });
    });
}
