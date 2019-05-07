import { gql, t, Key } from '../common';

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

export function init(args: { getDb: t.GetConverstaionDb; keys: Key }) {
  const { getDb, keys } = args;

  /**
   * [Resolvers]
   */
  const resolvers: t.IResolvers = {
    Mutation: {
      conversation: () => ({}),
    },

    MutationConversation: {
      threads: () => ({}),
    },

    MutationConversationThreads: {
      save: async (_: any, args: { thread: t.IThreadModel }, ctx: any, info: any) => {
        const { thread } = args;
        if (!thread) {
          throw new Error(`Cannot save. Conversation thread not supplied.`);
        }
        const db = await getDb();

        // Save thead-items.
        const items: any = {};
        thread.items.forEach(item => {
          const key = keys.thread.itemDbKey(item);
          items[key] = item;
        });
        await db.putMany(items);

        // Save users.
        const users = thread.users || [];
        await db.put(keys.thread.usersDbKey(thread) as any, users);

        // Finish up.
        return true;
      },
    },
  };

  return { resolvers, typeDefs };
}
