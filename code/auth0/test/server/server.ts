import { AccessToken, ApolloServer, gql, log, t, time } from './common';
export { log };

/**
 * [Types]
 */
const typeDefs = gql`
  type User {
    email: String
    elapsed: String
  }
  type Query {
    me: User!
  }
`;

/**
 * [Resolvers]
 */
const resolvers = {
  Query: {
    me: async (_: any, args: any, ctx: t.IContext, info: any) => {
      const timer = time.timer();
      const user = await ctx.getUser();
      const email = user ? user.email : undefined;
      const elapsed = timer.elapsed.toString();
      return { email, elapsed };
    },
  },
};

/**
 * [Server]
 */
export const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context(e): Promise<t.IContext> {
    const getToken = async () => {
      const headers = e.req.headers;
      const token = headers.authorization;

      if (!token) {
        log.info(`✋  No authorization token found.\n`);
      }

      return !token
        ? undefined
        : AccessToken.create({
            token,
            audience: 'https://uiharness.com/api/sample',
            issuer: 'https://test-platform.auth0.com/',
            algorithms: ['RS256'],
          });
    };

    const getUser = async () => {
      const token = await getToken();
      return token ? token.getProfile() : undefined;
    };

    return { getUser, getToken };
  },
});
