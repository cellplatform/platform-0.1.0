import { gql, Command, t, graphql } from '../common';

type P = t.ICommandProps;

export const root = Command.create<P>('root')
  //
  .add('tmp', async e => {
    const query = gql`
      query Json {
        json
      }
    `;

    const client = e.props.client;
    const res = await client.query({ query });
    e.props.next({ res });
  });
