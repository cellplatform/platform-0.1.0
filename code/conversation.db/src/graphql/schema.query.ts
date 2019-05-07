import { gql, t, Key, R } from '../common';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Query {
    foo: JSON
    conversation: QueryConversation!
  }

  type QueryConversation {
    thread(id: ID!): QueryConversationThread
  }

  type QueryConversationThread {
    id: ID!
    items(kind: String): [JSON]
    users: [String]!
  }
`;

/**
 * [Initialize]
 */
export function init(args: { getDb: t.GetConverstaionDb; keys: Key }) {
  const { getDb, keys } = args;

  /**
   * [Resolvers]
   */
  const resolvers: t.IResolvers = {
    Query: {
      foo: async (_: any, args: any, ctx: t.IContext, info: any) => {
        const db = await getDb();

        // TEMP 🐷
        const values = await db.values({ pattern: 'MSG/th/1234/i' });
        Object.keys(values).forEach(key => {
          values[key] = values[key].value;
        });

        return values;
      },

      conversation: () => ({}),
    },

    QueryConversation: {
      thread: async (_: any, args: { id: string }, ctx: t.IContext, info: any) => {
        const id = args.id || '';
        const db = await getDb();
        const exists = (await db.get(keys.thread.metaDbKey(id))).props.exists;
        return exists ? { id } : null;
      },
    },

    QueryConversationThread: {
      items: async (_: { id: string }, args: { kind?: string }, ctx: t.IContext, info: any) => {
        const { kind } = args;
        const db = await getDb();
        const pattern = keys.thread.dbKey(_.id);
        const values = await db.values({ pattern });
        const items = Object.keys(values)
          .map(key => values[key].value)
          .filter(item => Boolean(item.kind))
          .filter(item => (kind ? item.kind === kind : true));
        return R.sortBy(R.prop('timestamp'), items);
      },

      users: async (_: { id: string }, args: {}, ctx: t.IContext, info: any) => {
        const db = await getDb();
        const pattern = keys.thread.usersDbKey(_.id);
        const users = (await db.get(pattern)).value;
        return users || [];
      },
    },
  };

  // Finish up.
  return { resolvers, typeDefs };
}

/**
 * [Helpers]
 */
