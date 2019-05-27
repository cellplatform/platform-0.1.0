import { t, identity } from '../common';

/**
 * Keys for conversation-threads.
 */
export class MsgThreadKey {
  /**
   * [Lifecycle]
   */
  public constructor(args: {}) {
    //
  }

  /**
   * [Properties]
   */
  public get dbPrefix() {
    return 'MSG';
  }

  /**
   * [DB]
   */
  public dbKey(thread: t.IThreadModel | string) {
    const id = typeof thread === 'string' ? thread : thread.id;
    return `${this.dbPrefix}/${id}`;
  }

  public itemsDbKey(thread: t.IThreadModel | string) {
    const id = typeof thread === 'string' ? thread : thread.id;
    return `${this.dbPrefix}/${id}/i`;
  }

  public itemDbKey(item: t.ThreadItem | string) {
    const id = typeof item === 'string' ? item : item.id;
    return `${this.dbPrefix}/${id}`;
  }

  public usersDbKey(thread: t.IThreadModel | string) {
    const id = typeof thread === 'string' ? thread : thread.id;
    return `${this.dbPrefix}/${id}/users`;
  }

  public metaDbKey(thread: t.IThreadModel | string) {
    const id = typeof thread === 'string' ? thread : thread.id;
    return `${this.dbPrefix}/${id}/meta`;
  }

  /**
   * [ID]
   */
  public itemId(thread: t.IThreadModel | string, uniq?: string) {
    const threadId = typeof thread === 'string' ? thread : thread.id;
    return `${threadId}/i/${uniq || identity.shortid()}`;
  }

  public threadId(uniq?: string) {
    const id = `${uniq || identity.cuid()}`.replace(/^th\//, '');
    return `th/${id}`;
  }
}
