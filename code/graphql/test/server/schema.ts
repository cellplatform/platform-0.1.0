import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { gql } from './common';

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
export const resolvers: IResolvers = {
  Query: {
    json: async (_: any, args: any, ctx: any, info: any) => {
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
