import { gql, t } from '../common';
import { ThreadDbKey } from '../keys';

/**
 * [Types]
 */
export const typeDefs = gql`
  type Mutation {
    conversation: MutationConversation
  }

  type MutationConversation {
    thread: MutationConversationThread
  }

  type MutationConversationThread {
    save(thread: JSON): Boolean
  }
`;

/**
 * [Initialize]
 */

export function init(args: { getDb: t.GetConverstaionDb }) {
  const { getDb } = args;
  const keys = new ThreadDbKey();

  /**
   * [Resolvers]
   */
  const resolvers: t.IResolvers = {
    Mutation: {
      conversation: () => ({}),
    },

    MutationConversation: {
      thread: () => ({}),
    },

    MutationConversationThread: {
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
          const key = keys.itemKey(thread, item);
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
