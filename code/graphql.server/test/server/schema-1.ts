import { makeExecutableSchema } from 'graphql-tools';
import { gql, log, t } from './common';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Address {
    street: String
    city: String
  }

  type User {
    email: String
    address: Address
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
  User: {
    address: async (_: any, args: any, ctx: t.IContext, info: any) => {
      return { street: '221b Baker Street', city: 'London' };
    },
  },

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

/**
 * [Schema]
 */
export function init(args: {}) {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  return schema;
}
