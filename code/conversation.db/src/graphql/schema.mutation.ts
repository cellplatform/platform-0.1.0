import { gql, t } from '../common';

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
        const db = await getDb();
        await db.put('FOO', args);

        // DATA.foo = args.foo;
        console.log('thread/save:', args.thread);
        return true;
      },
    },
  };

  return { resolvers, typeDefs };
}
