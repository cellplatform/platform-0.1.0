import { express, ApolloServer, t } from './common';
import { resolvers, typeDefs } from './resolvers';
import { Context } from './Context';

const pkg = require('../../package.json');

/**
 * [Express] web server.
 */
export const server = express();

/**
 * [GraphQL] server.
 */
export const graphql = new ApolloServer({
  typeDefs,
  resolvers,

  /**
   * Enable playground in production.
   * - https://www.apollographql.com/docs/apollo-server/features/graphql-playground#enabling-graphql-playground-in-production
   */
  playground: true,
  introspection: true,

  /**
   * Generate the context that is passed to each resolver.
   */
  context(e): t.IContext {
    return new Context({});
  },
});

graphql.applyMiddleware({ app: server });

/**
 * [Routes]
 */
server.get('*', (req, res) => {
  const { name, version } = pkg;
  res.send({ name, version });
});
