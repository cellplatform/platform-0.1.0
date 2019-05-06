import { makeExecutableSchema } from 'graphql-tools';
import { gql, t } from './common';

/**
 * [Types]
 */
export const typeDefs = gql`
  scalar JSON

  type Query {
    json: JSON
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Query: {
    json: async (_: any, args: any, ctx: t.IContext, info: any) => {
      return { foo: 123, bar: 456 };
    },
  },
};

/**
 * [Schema]
 */
export function init(args: {}) {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  return schema;
}
