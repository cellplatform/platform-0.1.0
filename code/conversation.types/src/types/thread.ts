import * as t from '../types';

/**
 * A conversation thread.
 */
export type IThreadModel = {
  id: string;
  items: ThreadItem[];
  users: t.IUserIdentity[];
};

/**
 * Definitions of items that may appear in a thread.
 */
export type ThreadItem = IThreadComment;

export type IThreadComment = {
  kind: 'THREAD/comment';
  id: string;
  timestamp: number;
  user: string;
  body?: { markdown: string };
};
