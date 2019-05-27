import { auth, ForbiddenError } from './common';

type IContextArgs = {
  jwt?: string;
};

/**
 * The Context that is passed to all GraphQL resolvers.
 */
export class Context {
  /**
   * [Lifecycle]
   */
  constructor(args: IContextArgs) {
    this.jwt = args.jwt;
  }

  /**
   * [Fields]
   */
  public readonly jwt: string | undefined;

  /**
   * [Methods]
   */
  public async getUser() {
    return { id: '123', email: 'mary@example.com', roles: [] };
  }

  /**
   * Determine if the user is authorized via the given policies.
   */
  public async authorize(args: { policy: auth.IAuthPolicies; variables?: object }) {
    const { policy, variables } = args;
    const user = await this.getUser();
    return auth.authorize({ policy, user, variables, getError: msg => new ForbiddenError(msg) });
  }
}
