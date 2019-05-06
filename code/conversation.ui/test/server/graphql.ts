import { ApolloServer, express } from './common';
import { resolvers, typeDefs } from './resolvers';

import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import * as db from '@platform/conversation.db';

const pkg = require('../../../package.json');

/**
 * Prepare the schema.
 */
const dbSchema = db.graphql.init({}).schema;
const localSchema = makeExecutableSchema({ typeDefs, resolvers });
const schema = mergeSchemas({ schemas: [dbSchema, localSchema] });

/**
 * [Express] web server.
 */
export const app = express();

/**
 * [GraphQL] server.
 */
export const server = new ApolloServer({ schema });
server.applyMiddleware({ app });

/**
 * [Routes]
 */
app.get('*', (req, res) => {
  const { name, version } = pkg;
  res.send({ name, version });
});
