import { ApolloServer, express } from './common';
import { resolvers, typeDefs } from './resolvers';

import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import * as db from '@platform/conversation.db';

/**
 * Prepare the schema.
 * Note:
 *    This example shows merging the `conversation` schema into another
 *    schema which will be the typical way the GraphQL API is used.
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
