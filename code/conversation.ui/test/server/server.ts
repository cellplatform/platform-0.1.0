import { graphql } from '@platform/conversation.db';
import { mergeSchemas } from 'graphql-tools';

import { ApolloServer, express, t } from './common';
import { getDb } from './db';
import { schema as localSchema } from './schema.local';

/**
 * Prepare the schema.
 * Note:
 *    This example shows merging the `conversation` schema into another
 *    schema which will be the typical way the GraphQL API is used.
 */
const schemas = {
  db: graphql.init({ getDb }).schema,
  local: localSchema,
};
const schema = mergeSchemas({ schemas: [schemas.db, schemas.local] });

/**
 * [Express] web server.
 */
export const app = express();

/**
 * [GraphQL] server.
 */
export const server = new ApolloServer({
  schema,
  async context(e): Promise<t.IGqlContext> {
    const jwt = e.req.headers.authorization;
    return { jwt };
  },
});
server.applyMiddleware({ app });
