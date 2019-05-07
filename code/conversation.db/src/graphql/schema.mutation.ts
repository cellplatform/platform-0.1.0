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
    saveAll(thread: JSON): Boolean
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
      saveAll: async (_: any, args: t.IThreadModel, ctx: any, info: any) => {
        const db = await getDb();
        await db.put('FOO', args);

        // DATA.foo = args.foo;
        console.log('saveThread', args);
        return true;
      },
    },
  };

  return { resolvers, typeDefs };
}
