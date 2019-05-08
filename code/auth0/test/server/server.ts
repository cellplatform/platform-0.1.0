import { AccessToken, ApolloServer, gql, log, t, time } from './common';

const pkg = require('../../../package.json');

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
 * Define the server.
 */
export const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context(e): Promise<t.IContext> {
    const getToken = async () => {
      const headers = e.req.headers;
      const authorization = headers.authorization;

      if (!authorization) {
        log.info(`✋  No authorization token found.\n`);
      }

      return !authorization
        ? undefined
        : AccessToken.create({
            token: authorization,
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

/**
 * Start the server.
 */
export async function start() {
  const port = 8080;
  await server.listen({ port });

  const url = log.cyan(`http://localhost:${log.magenta(port)}${log.gray('/graphql')}`);
  log.info.gray(`\n👋  Running on ${url}`);
  log.info();
  log.info.gray(`   - package:   ${pkg.name} (test)`);
  log.info.gray(`   - version:   ${pkg.version}`);
  log.info();
}
