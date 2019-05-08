import { makeExecutableSchema } from 'graphql-tools';
import { gql, t } from './common';

let count = 0;

/**
 * [Types]
 */
export const typeDefs = gql`
  scalar JSON

  type Query {
    foo: JSON
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Query: {
    foo: async (_: any, args: any, ctx: t.IContext, info: any) => {
      const auth = await ctx.authorize({ permissions: ['READ'] });
      count++;
      return { count, message: `Hello ${count}`, auth };
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
