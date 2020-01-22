import { is, log, auth, ForbiddenError, t, MemoryCache } from '../common';

export type GetContext = (ctx: t.IGqlContext) => Context;

type IContextArgs = {
  jwt?: string;
  keys: t.MsgKeys;
  getDb: t.GetDb;
};

const cache = new MemoryCache({ ttl: 2000 });

/**
 * The Context that is passed to all GraphQL resolvers.
 */
export class Context {
  /**
   * [Static]
   */
  public static create(args: IContextArgs) {
    return new Context(args);
  }

  public static cache(cacheKey: string) {
    return {
      get(args: IContextArgs) {
        return cache.get<Context>(cacheKey, () => Context.create(args)) as Context;
      },
    };
  }

  /**
   * [Lifecycle]
   */
  constructor(args: IContextArgs) {
    const { jwt, getDb, keys } = args;
    this.jwt = jwt;
    this.getDb = getDb;
    this.keys = keys;
  }

  /**
   * [Fields]
   */
  public readonly jwt: string | undefined;
  public readonly getDb: t.GetDb;
  public readonly keys: t.MsgKeys;

  /**
   * [Methods]
   */

  /**
   * Retrieve the auth-user from the access-token.
   */
  public async getUser() {
    // TODO 🐷 - getUser from token.
    if (is.dev) {
      log.info(`FAKE dev user returned. 🐷`);
      return { id: '1234', roles: [] };
    }
    return undefined;
  }

  /**
   * Determine if the user is authorized via the given policies.
   */
  public async authorize(args: { policy: t.IAuthPolicy | t.IAuthPolicy[]; variables?: object }) {
    const { policy, variables } = args;
    const user = await this.getUser();
    return auth.authorize({ policy, user, variables, getError: msg => new ForbiddenError(msg) });
  }
}
