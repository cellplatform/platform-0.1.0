import { t } from '../common';
import { makeExecutableSchema } from 'graphql-tools';
import * as common from './schema.common';
import * as query from './schema.query';
import * as mutation from './schema.mutation';

/**
 * [Schema]
 */
export function init(args: { getDb: t.GetConverstaionDb }) {
  const schema = makeExecutableSchema({
    typeDefs: [common.typeDefs, query.typeDefs, mutation.typeDefs],
    resolvers: [query.init(args).resolvers, mutation.init(args).resolvers],
  });
  return schema;
}
