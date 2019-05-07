/**
 * A conversation thread.
 */
export type IThreadModel = {
  id: string;
  items: ThreadItem[];
  users: string[];
};

/**
 * Definitions of items that may appear in a thread.
 */
export type ThreadItem = IThreadComment;

export type IThreadComment = {
  kind: 'THREAD/comment';
  id: string;
  timestamp: number;
  user: IThreadUser;
  body?: { markdown: string };
};

/**
 * A user that is participating in a conversation-thread.
 */
export type IThreadUser = { id: string; name?: string };
