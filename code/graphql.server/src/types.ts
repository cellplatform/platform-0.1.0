/**
 * The common context object passed to resolvers.
 */
export type IGqlContext = {
  /**
   * The json-web-token that represents the `accessToken` of the authenticated user.
   * See: https://jwt.io
   */
  jwt?: string;
};
