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

export function init(args: { getDb: t.GetConverstaionDb }) {
  const { getDb } = args;
  const keys = new Key({});

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

        console.log('thread/save:', thread);

        if (!thread) {
          throw new Error(`Cannot save. Conversation thread not supplied.`);
        }

        const db = await getDb();
        // await db.put('FOO', thread);
        await db.delete('FOO');

        const batch: any = {};

        thread.items.forEach(item => {
          const key = keys.thread.itemDbKey(item);
          console.log('key', key);
          batch[key] = item;
        });

        // db.putMany()
        console.log('batch', batch);
        await db.putMany(batch);

        // DATA.foo = args.foo;
        return true;
      },
    },
  };

  return { resolvers, typeDefs };
}
