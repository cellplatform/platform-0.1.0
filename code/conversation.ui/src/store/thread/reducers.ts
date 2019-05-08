import { Key, R } from '../common';
import * as t from '../types';

export function init(args: { store: t.IThreadStore; keys: Key }) {
  const { store, keys } = args;
  const k = keys.thread;

  store
    // Load a complete thread.
    .on<t.IThreadLoadEvent>('THREAD/load')
    .subscribe(e => {
      const s = e.state;
      const draft = { ...s.draft };
      let thread = { ...e.payload.thread, draft };
      thread = formatThread(thread);
      e.change(thread);
    });

  store
    // Insert a new item into the thread.
    .on<t.IAddThreadItemEvent>('THREAD/add')
    .subscribe(e => {
      const s = e.state;
      const id = e.payload.item.id || k.itemId(s.id);
      const users = insertUser(e.payload.user, s.users);
      const items = [...s.items, { ...e.payload.item, id }];
      const draft = { ...s.draft };
      delete draft.markdown;
      const thread = formatThread({ ...s, items, users, draft });
      e.change(thread);
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
      e.change({ ...s, draft });
    });
}

/**
 * [Helpers]
 */
function formatThread(thread: t.IThreadStoreModel) {
  thread = formatUsers(thread);
  thread = sortItems(thread);
  return thread;
}

function formatUsers(thread: t.IThreadStoreModel) {
  // const ids = items.map(m => m.user.id);
  // const users = Array.from(new Set(ids));
  // return { ...thread, users };
  console.log(`\nTODO 🐷  syncUsers \n`);

  // console.group('🌳 syncUsers');
  // console.log('items', items);
  // console.groupEnd();
  thread = { ...thread, users: uniqueUsers(thread.users) };

  return thread;
}

function sortItems(thread: t.IThreadStoreModel) {
  const items = R.sortBy(R.prop('timestamp'), thread.items);
  return { ...thread, items };
}

function insertUser(user: t.IUserIdentity, users: t.IUserIdentity[]) {
  return uniqueUsers([...users, user]);
}

function uniqueUsers(users: t.IUserIdentity[]) {
  return R.uniqBy<t.IUserIdentity, any>(R.prop('id'), users);
}
