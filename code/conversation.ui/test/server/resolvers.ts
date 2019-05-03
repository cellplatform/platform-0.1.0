import { t, gql, log } from './common';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Query {
    foo: String
  }

  type Mutation {
    foo(message: String): Boolean
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Query: {
    foo: async (_: any, args: any, ctx: t.IContext, info: any) => {
      return 'Foo';
    },
  },

  Mutation: {
    foo: async (_: any, args: any, ctx: t.IContext, info: any) => {
      log.info('foo', args);
      return true;
    },
  },
};
