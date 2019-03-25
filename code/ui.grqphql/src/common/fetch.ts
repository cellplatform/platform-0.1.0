const fetch = require('isomorphic-fetch');

/**
 * See:
 * - https://github.com/graphql/graphiql#getting-started
 */
export function graphqlFetcher(graphQLParams: any) {
  return fetch(window.location.origin + '/graphql', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams),
  }).then((response: any) => response.json());
}
