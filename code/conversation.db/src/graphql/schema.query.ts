import { policy } from '../auth';
import { gql, log, R, t, value } from '../common';
import { GetContext } from './Context';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Query {
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
export function init(args: { getContext: GetContext }) {
  const { getContext } = args;

  /**
   * [Resolvers]
   */
  const resolvers: t.IResolvers = {
    Query: {
      conversation: () => ({}),
    },

    QueryConversation: {
      /**
       * Retrieve a single thread.
       */
      thread: async (_: any, args: { id: string }, c: t.IGqlContext, info: any) => {
        const ctx = await getContext(c.jwt);
        const k = ctx.keys.thread;
        const id = args.id || '';

        const auth = await ctx.authorize({ policy: [policy.userRequired, policy.read] });
        if (auth.isDenied) {
          auth.throw();
        }

        const exists = (await ctx.db.get(k.metaDbKey(id))).props.exists;
        return exists ? { id } : null;
      },
    },

    QueryConversationThread: {
      /**
       * Retrieve thread items.
       */
      items: async (_: { id: string }, args: { kind?: string }, c: t.IGqlContext, info: any) => {
        const ctx = await getContext(c.jwt);
        const k = ctx.keys.thread;

        const auth = await ctx.authorize({ policy: [policy.userRequired, policy.read] });
        if (auth.isDenied) {
          auth.throw();
        }

        log.TODO('ensure user is part of the thread. 🐷');

        const { kind } = args;
        const pattern = k.itemsDbKey(_.id);
        const values = await ctx.db.values({ pattern });
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
      users: async (_: { id: string }, args: {}, c: t.IGqlContext, info: any) => {
        const ctx = await getContext(c.jwt);
        const k = ctx.keys.thread;
        const auth = await ctx.authorize({ policy: [policy.userRequired, policy.read] });
        if (auth.isDenied) {
          auth.throw();
        }

        log.TODO('ensure user is part of the thread. 🐷');

        const pattern = k.usersDbKey(_.id);
        const users = (await ctx.db.get(pattern)).value;
        return users || [];
      },
    },
  };

  // Finish up.
  return { resolvers, typeDefs };
}
