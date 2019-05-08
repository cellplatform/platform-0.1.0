import * as t from '../types';

export type IThreadStore = t.IStore<IThreadStoreModel, ThreadEvent>;
export type IThreadStoreContext = t.IStoreContext<IThreadStoreModel, ThreadEvent>;

export type IThreadStoreModel = t.IThreadModel & {
  draft: IThreadDraft;
};

export type IThreadDraft = { user: t.IUserIdentity; markdown?: string };

/**
 * [Events]
 */
export type ThreadEvent =
  | IThreadLoadEvent
  | IThreadLoadedEvent
  | IThreadLoadFromIdEvent
  | IAddThreadItemAddEvent
  | IAddThreadItemAddedEvent
  | IThreadItemsEvent
  | IThreadDraftEvent
  | IThreadDraftFocusEvent;

export type IThreadLoadEvent = {
  type: 'THREAD/load';
  payload: { thread: t.IThreadModel };
};
export type IThreadLoadedEvent = {
  type: 'THREAD/loaded';
  payload: { thread: t.IThreadModel };
};

export type IThreadLoadFromIdEvent = {
  type: 'THREAD/loadFromId';
  payload: { id: string; user: t.IUserIdentity };
};

export type IAddThreadItemAddEvent = {
  type: 'THREAD/add';
  payload: { user: t.IUserIdentity; item: t.ThreadItem };
};
export type IAddThreadItemAddedEvent = {
  type: 'THREAD/added';
  payload: { user: t.IUserIdentity; item: t.ThreadItem };
};

export type IThreadItemsEvent = {
  type: 'THREAD/items';
  payload: { items: t.ThreadItem[] };
};

export type IThreadDraftEvent = {
  type: 'THREAD/draft';
  payload: { draft: t.IThreadDraft };
};

export type IThreadDraftFocusEvent = {
  type: 'THREAD/draft/focus';
  payload: {};
};
