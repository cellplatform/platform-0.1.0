import { makeExecutableSchema } from 'graphql-tools';
import { gql, log, t } from './common';
import { Context } from './Context';

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

  type Store {
    write(value: String): Boolean
  }

  type Query {
    me: User
  }

  type Mutation {
    echo(message: String): String
    store: Store
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  User: {
    address: async (_: any, args: any, ctx: Context, info: any) => {
      return { street: '221b Baker Street', city: 'London' };
    },
  },

  Store: {
    write: async (_: any, args: any, ctx: Context, info: any) => {
      log.info('nested mutation:', args);
      return true;
    },
  },

  Query: {
    me: async (_: any, args: any, ctx: Context, info: any) => {
      return ctx.getUser();
    },
  },

  Mutation: {
    echo: async (_: any, args: { message: string }, ctx: Context, info: any) => {
      const res = `Echo: ${args.message}`;
      log.info(res);
      return res;
    },

    store: async (_: any, args: any, ctx: Context, info: any) => {
      return {};
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
