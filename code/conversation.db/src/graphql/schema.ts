import { t } from '../common';
import { makeExecutableSchema } from 'graphql-tools';
import * as common from './schema.common';
import * as query from './schema.query';
import * as mutation from './schema.mutation';
import { GetContext, Context } from './Context';

/**
 * [Schema]
 */
export function init(args: { getDb: t.GetDb; keys?: t.Keys }) {
  const { getDb } = args;
  const keys = (args.keys = new t.Keys({}));

  const getContext: GetContext = async jwt => new Context({ jwt, keys, db: await getDb() });
  const o = { getContext };

  const schema = makeExecutableSchema({
    typeDefs: [common.typeDefs, query.typeDefs, mutation.typeDefs],
    resolvers: [query.init(o).resolvers, mutation.init(o).resolvers],
  });
  return schema;
}
