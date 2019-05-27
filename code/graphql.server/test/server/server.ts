import { ApolloServer, express, pkg } from './common';
import { Context } from './Context';
import { init } from './schema';

/**
 * [Express] web server.
 */
export const server = express();

/**
 * [GraphQL] server.
 */
const schema = init({});
export const graphql = new ApolloServer({
  schema,

  /**
   * Enable playground in production.
   * - https://www.apollographql.com/docs/apollo-server/features/graphql-playground#enabling-graphql-playground-in-production
   */
  playground: true,
  introspection: true,

  /**
   * Generate the context that is passed to each resolver.
   */
  context(e) {
    const jwt = e.req.headers.authorization;
    return new Context({ jwt });
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
