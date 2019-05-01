import { t, gql, log } from './common';

/**
 * [Types]
 */
export const typeDefs = gql`
  type User {
    email: String
  }

  type Query {
    me: User
  }

  type Mutation {
    echo(message: String): String
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Query: {
    me: async (_: any, args: any, ctx: t.IContext, info: any) => {
      return ctx.getUser();
    },
  },

  Mutation: {
    echo: async (_: any, args: { message: string }, ctx: t.IContext, info: any) => {
      const res = `Echo: ${args.message}`;
      log.info(res);
      return res;
    },
  },
};
