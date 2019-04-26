import { AccessToken, ApolloServer, gql, log, t } from './common';

// const options = {
//   audience: 'https://uiharness.com/api/sample',
//   issuer: 'https://test-platform.auth0.com/',
// };

/**
 * [Types]
 */
const typeDefs = gql`
  type User {
    name: String
  }
  type Query {
    me: User
  }
`;

/**
 * [Resolvers]
 */
const resolvers = {
  Query: {
    me: (_: any, args: any, ctx: t.IContext, info: any) => {
      return { name: ctx.foo };
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
    const authorization = e.req.headers.authorization;

    if (authorization) {
      const token = await AccessToken.create({
        token: authorization,
        audience: 'https://uiharness.com/api/sample',
        issuer: 'https://test-platform.auth0.com/',
        algorithms: ['RS256'],
      });

      console.log('token.sub', token.sub);

      // const user = await token.getProfile();
      // console.log('user', user);
    }

    return { foo: 1234 };
  },
});

/**
 * Start the server.
 */
export async function start() {
  const port = 8080;
  await server.listen({ port });

  const url = log.cyan(`http://localhost:${log.magenta(port)}`);
  log.info.gray(`\n👋  Auth server on ${url}`);
  log.info();
}
