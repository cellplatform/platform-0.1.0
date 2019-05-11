import { policy } from '../auth';
import { gql, log, t } from '../common';

import { GetContext } from './Context';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Mutation {
    conversation: MutationConversation
  }

  type MutationConversation {
    threads: MutationConversationThreads
  }

  type MutationConversationThreads {
    save(thread: JSON): Boolean
  }
`;

/**
 * [Initialize]
 */

export function init(args: { toContext: GetContext }) {
  const { toContext } = args;

  /**
   * [Resolvers]
   */
  const resolvers: t.IResolvers = {
    Mutation: {
      /**
       * Namespace.
       */
      conversation: () => ({}),
    },

    MutationConversation: {
      /**
       * Namespace.
       */
      threads: () => ({}),
    },

    MutationConversationThreads: {
      /**
       * Save a complete conversation-thread.
       */
      save: async (_: any, args: { thread: t.IThreadModel }, c: t.IGqlContext, info: any) => {
        const ctx = toContext(c);
        const k = ctx.keys.thread;

        const auth = await ctx.authorize({ policy: [policy.userRequired, policy.save] });
        if (auth.isDenied) {
          auth.throw();
        }

        log.TODO('ensure user is part of the thread. 🐷');

        const { thread } = args;
        if (!thread) {
          throw new Error(`Cannot save. Conversation thread not supplied.`);
        }
        const items = thread.items.reduce(
          (acc, next) => ({ ...acc, [k.itemDbKey(next)]: next }),
          {},
        );
        const updates = {
          [k.metaDbKey(thread)]: {}, // NB: Future meta-data. Included now to make the root thread item searchable.
          [k.usersDbKey(thread)]: thread.users || [],
          ...items,
        };

        // Save:
        //  - meta-data
        //  - items
        //  - users
        const db = await ctx.getDb();
        await db.putMany(updates);

        // Finish up.
        return true;
      },
    },
  };

  // Finish up.
  return { resolvers, typeDefs };
}
