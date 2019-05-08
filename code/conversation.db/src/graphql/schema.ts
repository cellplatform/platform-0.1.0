import { t, Key } from '../common';
import { makeExecutableSchema } from 'graphql-tools';
import * as common from './schema.common';
import * as query from './schema.query';
import * as mutation from './schema.mutation';

/**
 * [Schema]
 */
export function init(args: { getDb: t.GetConverstaionDb; keys?: Key }) {
  const { getDb } = args;
  const keys = (args.keys = new Key({}));
  const options = { getDb, keys };

  const schema = makeExecutableSchema({
    typeDefs: [common.typeDefs, query.typeDefs, mutation.typeDefs],
    resolvers: [query.init(options).resolvers, mutation.init(options).resolvers],
  });
  return schema;
}
