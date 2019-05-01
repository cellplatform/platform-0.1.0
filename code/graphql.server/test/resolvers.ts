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
    send(message: String): Boolean
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
    send: async (_: any, args: any, ctx: t.IContext, info: any) => {
      log.info('send', args);
      return true;
    },
  },
};
