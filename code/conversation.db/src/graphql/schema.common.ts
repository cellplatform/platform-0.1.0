import { gql } from '../common';

/**
 * [Types]
 */
export const typeDefs = gql`
  scalar JSON

  type ConversationUser {
    id: ID!
    name: String
    email: String
  }
`;
