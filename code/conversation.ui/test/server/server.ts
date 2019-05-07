import { ApolloServer, express } from './common';
import { resolvers, typeDefs } from './resolvers';

import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { graphql } from '@platform/conversation.db';
import { getDb } from './db';

/**
 * Prepare the schema.
 * Note:
 *    This example shows merging the `conversation` schema into another
 *    schema which will be the typical way the GraphQL API is used.
 */
const schemas = {
  db: graphql.init({ getDb }).schema,
  local: makeExecutableSchema({ typeDefs, resolvers }),
};
const schema = mergeSchemas({ schemas: [schemas.db, schemas.local] });

/**
 * [Express] web server.
 */
export const app = express();

/**
 * [GraphQL] server.
 */
export const server = new ApolloServer({ schema });
server.applyMiddleware({ app });
