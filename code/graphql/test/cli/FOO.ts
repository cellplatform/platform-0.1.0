import ApolloClient from 'apollo-boost';
import { gql } from '../common';

const query = gql`
  query Json {
    json
  }
`;

const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql',
});

export async function tmp() {
  const res = await client.query({ query, fetchPolicy: 'network-only' });
  return res;
}
