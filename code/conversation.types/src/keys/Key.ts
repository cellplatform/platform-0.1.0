import { ThreadKey } from './ThreadKey';

export class Key {
  /**
   * [Lifecycle]
   */
  public constructor(args: {}) {
    this.thread = new ThreadKey({});
  }

  /**
   * [Fields]
   */
  public readonly thread: ThreadKey;
}
