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
 * [Resolvers]
 */
export const resolvers: t.IResolvers = {
  Mutation: {
    conversation: () => ({}),
  },

  MutationConversation: {
    thread: () => ({}),
  },

  MutationConversationThread: {
    saveAll: async (_: any, args: t.IThreadModel, ctx: any, info: any) => {
      // DATA.foo = args.foo;
      console.log('saveThread', args);
      return true;
    },
  },
};
