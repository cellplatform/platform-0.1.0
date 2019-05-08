import { log, ApolloServer, express, t, ForbiddenError } from './common';
import { schema as localSchema } from './schema.local';

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
  async context(e): Promise<t.IContext> {
    return {
      /**
       * Authorize the request.
       * ☝️ Ensure the implementing server that stitches in this
       *    `conversation.db` schema implements this `authorize` function.
       */
      async authorize(policy) {
        const token = e.req.headers.authorization;
        if (!token) {
          log.info(`✋  No authorization token.\n`);
        } else {
          log.info(`Authorzation token: ${log.yellow(token)}`);
        }

        // const isAllowed = token === 'phil'; // NB: Obviously not this! 🐷
        const isAllowed = true; // ALLOW everything.

        const result: t.IAuthResult = {
          isAllowed,
          matches: [],
          user: undefined,
          throw(message) {
            throw new ForbiddenError(message || 'Not allowed.');
          },
        };

        return result;
      },
    };
  },
});
server.applyMiddleware({ app });
