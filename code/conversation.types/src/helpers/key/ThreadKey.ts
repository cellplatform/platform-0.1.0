import { t, idUtil } from '../../common';

export class ThreadKey {
  /**
   * [Lifecycle]
   */
  public constructor(args: {}) {
    //
  }

  /**
   * [Methods]
   */
  public itemDbKey(item: t.ThreadItem) {
    return `MSG/${item.id}`;
  }

  public itemId(threadId: string, uniq?: string) {
    return `${threadId}/i/${uniq || idUtil.shortid()}`;
  }

  public id(uniq?: string) {
    return `th/${uniq || idUtil.cuid()}`;
  }
}
