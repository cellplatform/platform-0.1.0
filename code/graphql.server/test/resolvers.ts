import { t, gql, log } from './common';

/**
 * [Types]
 */
export const typeDefs = gql`
  scalar JSON

  type User {
    email: String
  }

  type Query {
    me: User
    json: JSON
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

    json: async (_: any, args: any, ctx: t.IContext, info: any) => {
      return { foo: 123, bar: 456 };
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
