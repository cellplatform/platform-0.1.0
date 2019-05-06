import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { gql } from './common';

let count = 0;
const DATA = {
  foo: { initial: true } as any,
};

/**
 * [Types]
 */
export const typeDefs = gql`
  scalar JSON

  type Query {
    json: JSON
    fail: Boolean
  }

  type Mutation {
    change(foo: JSON): Boolean
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: IResolvers = {
  Query: {
    json: async (_: any, args: any, ctx: any, info: any) => {
      count++;
      return { count, message: `Hello ${count}`, foo: DATA.foo };
    },

    fail: async (_: any, args: any, ctx: any, info: any) => {
      throw new Error('Fail!');
    },
  },

  Mutation: {
    change: async (_: any, args: { foo: object }, ctx: any, info: any) => {
      DATA.foo = args.foo;
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
