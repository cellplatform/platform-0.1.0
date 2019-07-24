import { makeExecutableSchema } from 'graphql-tools';
import { gql, t } from './common';
import { db } from './db';

/**
 * [Types]
 */
export const typeDefs = gql`
  scalar JSON

  type Query {
    read: JSON
  }

  type Mutation {
    change: JSON
  }
`;

/**
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Query: {
    read: async (_: any, args: any, c: t.IGqlContext, info: any) => {
      const res = await db.find('**');
      console.log('res.list', res.list);
      return { items: res.list };
    },
  },

  Mutation: {
    change: async (_: any, args: any, c: t.IGqlContext, info: any) => {
      let value = (await db.getValue<any>('foo/bar')) || { count: 0 };
      value = { ...value, count: value.count + 1 };
      await db.put('foo/bar', value);
      return value;
    },
  },
};

/**
 * [Schema]
 */
export const schema = makeExecutableSchema({ typeDefs, resolvers });
