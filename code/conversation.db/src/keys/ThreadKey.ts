import { t } from '../common';

export class ThreadDbKey {
  public itemKey(thread: t.IThreadModel, item: t.ThreadItem) {
    return `MSG/thread/${thread.id}/item/${item.id}`;
  }
}
