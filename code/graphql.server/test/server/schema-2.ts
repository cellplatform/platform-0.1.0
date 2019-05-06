import { makeExecutableSchema } from 'graphql-tools';
import { gql, t } from './common';

let count = 0;

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
      count++;
      return { count, message: `Hello ${count}` };
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
