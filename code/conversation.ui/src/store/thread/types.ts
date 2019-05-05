import * as t from '../types';

export type IThreadStore = t.IStore<IThreadModel, ThreadEvent>;

export type IThreadModel = {
  items: ThreadItem[];
  draft?: IThreadDraft;
};

export type IThreadDraft = { markdown: string };

/**
 * [Items]
 */
export type ThreadItem = IThreadComment;

export type IThreadComment = {
  kind: 'THREAD/comment';
  id: string;
  timestamp: Date;
};

/**
 * [Events]
 */
export type ThreadEvent = IAddThreadItemEvent | IThreadItemsEvent | IThreadDraftEvent;

export type IAddThreadItemEvent = {
  type: 'THREAD/add';
  payload: { item: ThreadItem };
};

export type IThreadItemsEvent = {
  type: 'THREAD/items';
  payload: { items: ThreadItem[] };
};

export type IThreadDraftEvent = {
  type: 'THREAD/draft';
  payload: { draft?: IThreadDraft };
};
