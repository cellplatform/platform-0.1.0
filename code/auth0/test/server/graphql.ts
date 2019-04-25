import { log, ApolloServer, gql } from './common';

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
    me: () => {
      return { name: 'FOO' };
    },
  },
};

/**
 * Define the server.
 */
export const server = new ApolloServer({ typeDefs, resolvers });

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
