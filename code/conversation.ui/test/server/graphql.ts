import { ApolloServer, express } from './common';
import { resolvers, typeDefs } from './resolvers';

const pkg = require('../../../package.json');

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
});
graphql.applyMiddleware({ app: server });

/**
 * [Routes]
 */
server.get('*', (req, res) => {
  const { name, version } = pkg;
  res.send({ name, version });
});
