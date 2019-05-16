import { GraphQLResolveInfo } from 'graphql';

export type IGqlInfo = GraphQLResolveInfo;

/**
 * The common context object passed to resolvers.
 */
export type IGqlContext = {
  /**
   * The json-web-token that represents the `accessToken` of the authenticated user.
   * See: https://jwt.io
   */
  jwt?: string;

  /**
   * A unique ID for the request.
   */
  requestId: string;
};
