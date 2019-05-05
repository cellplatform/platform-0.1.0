import * as t from '../types';

export type IThreadStore = t.IStore<IThreadModel, ThreadEvent>;

export type IThreadModel = {
  items: ThreadItem[];
  draft: IThreadDraft;
};

export type IThreadDraft = { user: IThreadUser; markdown?: string };

/**
 * [Items]
 */
export type ThreadItem = IThreadComment;

export type IThreadComment = {
  kind: 'THREAD/comment';
  id: string;
  timestamp: Date;
  user: IThreadUser;
  body?: {
    markdown: string;
  };
};

export type IThreadUser = { id: string; name?: string };

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
  payload: { draft: IThreadDraft };
};
