import { t, idUtil } from '../../common';

export class ThreadKey {
  /**
   * [Lifecycle]
   */
  public constructor(args: {}) {
    //
  }

  /**
   * [DB]
   */
  public dbKey(thread: t.IThreadModel | string) {
    const id = typeof thread === 'string' ? thread : thread.id;
    return `MSG/${id}`;
  }

  public itemDbKey(item: t.ThreadItem | string) {
    const id = typeof item === 'string' ? item : item.id;
    return `MSG/${id}`;
  }

  public usersDbKey(thread: t.IThreadModel | string) {
    const id = typeof thread === 'string' ? thread : thread.id;
    return `MSG/${id}/users`;
  }

  public metaDbKey(thread: t.IThreadModel | string) {
    const id = typeof thread === 'string' ? thread : thread.id;
    return `MSG/${id}/meta`;
  }

  /**
   * [ID]
   */
  public itemId(thread: t.IThreadModel | string, uniq?: string) {
    const threadId = typeof thread === 'string' ? thread : thread.id;
    return `${threadId}/i/${uniq || idUtil.shortid()}`;
  }

  public id(uniq?: string) {
    return `th/${uniq || idUtil.cuid()}`;
  }
}
