import { t, gql, log } from './common';

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
    localFoo: async (_: any, args: any, ctx: t.IContext, info: any) => {
      const auth = await ctx.auth({ permissions: ['READ'] });
      return { msg: 'Local', auth };
    },
  },
};
