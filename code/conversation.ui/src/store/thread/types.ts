import * as t from '../types';

export type IThreadStore = t.IStore<IThreadStoreModel, ThreadEvent>;
export type IThreadStoreContext = t.IStoreContext<IThreadStoreModel, ThreadEvent>;

export type IThreadStoreModel = t.IThreadModel & {
  draft: IThreadDraft;
};

export type IThreadDraft = { user: t.IThreadUser; markdown?: string };

/**
 * [Events]
 */
export type ThreadEvent =
  | IThreadLoadEvent
  | IAddThreadItemEvent
  | IThreadItemsEvent
  | IThreadDraftEvent;

export type IThreadLoadEvent = {
  type: 'THREAD/load';
  payload: { thread: t.IThreadModel };
};

export type IAddThreadItemEvent = {
  type: 'THREAD/add';
  payload: { item: t.ThreadItem };
};

export type IThreadItemsEvent = {
  type: 'THREAD/items';
  payload: { items: t.ThreadItem[] };
};

export type IThreadDraftEvent = {
  type: 'THREAD/draft';
  payload: { draft: t.IThreadDraft };
};
