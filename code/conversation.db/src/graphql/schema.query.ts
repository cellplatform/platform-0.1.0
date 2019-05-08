import { gql, t, Key, R, value } from '../common';
import { POLICY } from '../auth';

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
    users: [ConversationUser]!
  }
`;

/**
 * [Initialize]
 */
export function init(args: { getDb: t.GetConverstaionDb; keys: Key }) {
  const { getDb, keys } = args;
  const k = keys.thread;

  /**
   * [Resolvers]
   */
  const resolvers: t.IResolvers = {
    Query: {
      /**
       * TEMP 🐷
       */
      foo: async (_: any, args: any, ctx: t.IContext, info: any) => {
        const db = await getDb();

        const values = await db.values({ pattern: 'MSG/th/1234/i' });
        Object.keys(values).forEach(key => {
          values[key] = values[key].value;
        });

        return values;
      },

      conversation: () => ({}),
    },

    QueryConversation: {
      /**
       * Retrieve a single thread.
       */
      thread: async (_: any, args: { id: string }, ctx: t.IContext, info: any) => {
        const id = args.id || '';

        const auth = await ctx.authorize(POLICY.THREAD.READ);
        if (!auth.isAllowed) {
          auth.throw();
        }

        const db = await getDb();
        const exists = (await db.get(k.metaDbKey(id))).props.exists;
        return exists ? { id } : null;
      },
    },

    QueryConversationThread: {
      /**
       * Retrieve thread items.
       */
      items: async (_: { id: string }, args: { kind?: string }, ctx: t.IContext, info: any) => {
        const auth = await ctx.authorize(POLICY.THREAD.READ);
        if (!auth.isAllowed) {
          auth.throw();
        }

        console.log(`\nTODO 🐷  ensure user is part of the thread. \n`);

        const { kind } = args;
        const db = await getDb();
        const pattern = k.itemsDbKey(_.id);
        const values = await db.values({ pattern });
        const items = value.object
          .toArray<{ value: { value: t.ThreadItem } }>(values)
          .filter(m => Boolean(m))
          .map(m => m.value.value)
          .filter(m => (kind ? m.kind === kind : true));
        return R.sortBy<t.ThreadItem>(R.prop('timestamp'), items);
      },

      /**
       * Retrieve the users of a thread.
       */
      users: async (_: { id: string }, args: {}, ctx: t.IContext, info: any) => {
        const auth = await ctx.authorize(POLICY.THREAD.READ);
        if (!auth.isAllowed) {
          auth.throw();
        }

        console.log(`\nTODO 🐷  ensure user is part of the thread. \n`);

        const db = await getDb();
        const pattern = k.usersDbKey(_.id);
        const users = (await db.get(pattern)).value;
        return users || [];
      },
    },
  };

  // Finish up.
  return { resolvers, typeDefs };
}
