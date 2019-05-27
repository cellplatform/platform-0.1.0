import { makeExecutableSchema } from 'graphql-tools';
import { gql, t } from './common';
import { Context } from './Context';

let count = 0;

const MY_POLICY: t.IAuthPolicy = {
  name: 'MY_AUTH_POLICY',
  eval(e) {
    e.grant();
  },
};

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
    foo: async (_: any, args: any, ctx: Context, info: any) => {
      const auth = await ctx.authorize({ policy: MY_POLICY });
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
