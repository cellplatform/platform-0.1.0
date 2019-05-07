import { makeExecutableSchema } from 'graphql-tools';
import { gql, t } from '../common';

/**
 * [Types]
 */
export const typeDefs = gql`
  scalar JSON

  type Query {
    foobar: String
  }

  type Mutation {
    thread(foo: JSON): Boolean
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Query: {
    foobar: async (_: any, args: any, ctx: t.IContext, info: any) => {
      return 'db.foobar';
    },
  },

  Mutation: {
    thread: async (_: any, args: { foo: object }, ctx: any, info: any) => {
      // DATA.foo = args.foo;
      console.log('db/thread', args);
      return true;
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
