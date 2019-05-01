import { t } from './common';

/**
 * The Context that is passed to all GraphQL resolvers.
 */
export class Context implements t.IContext {
  /**
   * [Lifecycle]
   */
  constructor(args: {}) {
    //
  }

  /**
   * [Methods]
   */
  public async getUser() {
    return { email: 'mary@example.com' };
  }
}
