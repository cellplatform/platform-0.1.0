const fetch = require('isomorphic-fetch');

/**
 * See:
 * - https://github.com/graphql/graphiql#getting-started
 */
export function graphqlFetcher(graphQLParams: any) {
  const url = `${window.location.origin}/graphql`;
  // const url = `https://api.blocktap.io/graphql`;
  return fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams),
  }).then((response: any) => response.json());
}
