import { gql, t } from '../common';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Mutation {
    thread(foo: JSON): Boolean
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Mutation: {
    thread: async (_: any, args: { foo: object }, ctx: any, info: any) => {
      // DATA.foo = args.foo;
      console.log('db/thread', args);
      return true;
    },
  },
};
