import { Key, R, UserIdentityType, time, value } from '../common';
import * as t from '../types';
import { data } from '../../data.graphql';

export function init(args: {
  store: t.IThreadStore;
  keys: Key;
  getGraphql: () => data.ConversationGraphql;
}) {
  const { store, keys, getGraphql } = args;
  const k = keys.thread;

  store
    // Load data from server.
    .on<t.IThreadLoadFromIdEvent>('THREAD/loadFromId')
    .subscribe(async e => {
      const { user } = e.payload;
      const id = keys.thread.threadId(e.payload.id);

      // Retrieve data from server.
      const graphql = getGraphql();
      let data = await graphql.thread.findById(id);

      // If the thread does not exist in the DB yet create an initial model now.
      if (!data) {
        data = {
          id,
          items: [],
          users: [],
        };
      }

      // Load into the state-tree.
      const draft = { user };
      const ui = { draft };
      const thread: t.IThreadStoreModel = { ...data, ui };
      store.dispatch({ type: 'THREAD/load', payload: { thread } });
    });

  store
    // Load a complete thread.
    .on<t.IThreadLoadEvent>('THREAD/load')
    .subscribe(async e => {
      const s = e.state;
      const draft = { ...s.ui.draft };
      const ui = { draft };
      let thread = { ...e.payload.thread, ui };
      thread = formatThread(thread);

      e.change(thread);
      await time.wait(0);
      e.dispatch({ type: 'THREAD/loaded', payload: { thread } });
    });

  store
    // Insert a new item into the thread.
    .on<t.IAddThreadItemAddEvent>('THREAD/add')
    .subscribe(async e => {
      const s = e.state;
      const user = e.payload.user;
      const users = UserIdentityType.insert(user, s.users);

      const id = e.payload.item.id || k.itemId(s.id);
      const item = { ...e.payload.item, id };
      const items = [...s.items, item];

      const draft = { ...s.ui.draft };
      delete draft.markdown;
      const ui = { ...s.ui, draft };

      const thread = formatThread({ ...s, items, users, ui });

      e.change(thread);
      await time.wait(0);
      e.dispatch({ type: 'THREAD/added', payload: { user, item } });
    });

  store
    // Update the thread-items list.
    .on<t.IThreadItemsEvent>('THREAD/items')
    .subscribe(e => {
      const s = e.state;
      const items = e.payload.items;
      const thread = formatThread({ ...s, items });
      e.change(thread);
    });

  store
    // Update the draft
    .on<t.IThreadDraftEvent>('THREAD/draft')
    .subscribe(e => {
      const s = e.state;
      const draft = e.payload.draft;
      const ui = { ...s.ui, draft };
      e.change({ ...s, ui });
    });

  store
    // Focus.
    .on<t.IThreadFocusEvent>('THREAD/focus')
    .subscribe(e => {
      const { target } = e.payload;
      const s = e.state;
      const ui = value.deleteUndefined({ ...s.ui, focus: target });
      e.change({ ...s, ui });
    });
}

/**
 * [Helpers]
 */
function formatThread(thread: t.IThreadStoreModel) {
  thread = formatUsers(thread);
  thread = sortThreadItems(thread);
  return thread;
}

function formatUsers(thread: t.IThreadStoreModel) {
  thread = {
    ...thread,
    users: UserIdentityType.uniq(thread.users),
  };
  return thread;
}

function sortThreadItems(thread: t.IThreadStoreModel) {
  const items = R.sortBy(R.prop('timestamp'), thread.items);
  return { ...thread, items };
}
