import { makeExecutableSchema } from 'graphql-tools';
import * as common from './schema.common';
import * as query from './schema.query';
import * as mutation from './schema.mutation';

/**
 * [Schema]
 */
export function init(args: {}) {
  const schema = makeExecutableSchema({
    typeDefs: [common.typeDefs, query.typeDefs, mutation.typeDefs],
    resolvers: [query.resolvers, mutation.resolvers],
  });
  return schema;
}
