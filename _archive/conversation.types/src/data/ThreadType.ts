import { t } from '../common';

/**
 * Helpers for working with the `IUserModel` type.
 */
export class ThreadType {
  /**
   * Removes any non-thread values from the model which
   * may have been added by the UI.
   */
  public static clean(thread: t.IThreadModel): t.IThreadModel {
    const { id, items, users } = thread;
    return { id, items, users };
  }
}
