import { gql, t } from '../common';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Query {
    foobar: String
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Query: {
    foobar: async (_: any, args: any, ctx: t.IContext, info: any) => {
      return 'converation.db/foobar!!';
    },
  },
};
