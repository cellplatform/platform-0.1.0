import { t } from '../common';
import { makeExecutableSchema } from 'graphql-tools';
import * as common from './schema.common';
import * as query from './schema.query';
import * as mutation from './schema.mutation';
import { GetContext, Context } from './Context';

/**
 * [Schema]
 */
export function init(args: { getDb: t.GetDb; keys?: t.MsgKeys }) {
  const { getDb } = args;
  const keys = (args.keys = new t.MsgKeys({}));

  const toContext: GetContext = ctx => {
    const { jwt } = ctx;
    return new Context({ jwt, keys, getDb });
  };
  const o = { toContext };

  const schema = makeExecutableSchema({
    typeDefs: [common.typeDefs, query.typeDefs, mutation.typeDefs],
    resolvers: [query.init(o).resolvers, mutation.init(o).resolvers],
  });
  return schema;
}
