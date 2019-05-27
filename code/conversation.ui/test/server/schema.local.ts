import { makeExecutableSchema } from 'graphql-tools';
import { gql, t } from './common';

/**
 * [Types]
 */
export const typeDefs = gql`
  scalar JSON

  type Query {
    localFoo: JSON
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Query: {
    localFoo: async (_: any, args: any, c: t.IGqlContext, info: any) => {
      return { msg: 'Local' };
    },
  },
};

/**
 * [Schema]
 */
export const schema = makeExecutableSchema({ typeDefs, resolvers });
