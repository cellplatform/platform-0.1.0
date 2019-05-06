import { ApolloServer, express, t, pkg } from './common';
import { init } from './schema';

/**
 * [Express] web server.
 */
export const server = express();

/**
 * [GraphQL] server.
 */
const schema = init({});
export const graphql = new ApolloServer({ schema });
graphql.applyMiddleware({ app: server });

/**
 * [Routes]
 */
server.get('*', (req, res) => {
  const { name, version } = pkg;
  res.send({ name, version });
});
