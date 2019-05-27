import { MsgThreadKey } from './MsgThreadKey';

export class MsgKeys {
  /**
   * [Lifecycle]
   */
  public constructor(args: {}) {
    this.thread = new MsgThreadKey({});
  }

  /**
   * [Fields]
   */
  public readonly thread: MsgThreadKey;
}
