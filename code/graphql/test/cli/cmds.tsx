import { Command, gql, log, t } from '../common';

type P = t.ICommandProps;

const query = gql`
  query Json {
    json
  }
`;

const mutation = gql`
  mutation ChangeFoo($msg: String) {
    change(foo: { msg: $msg })
  }
`;

export const root = Command.create<P>('root')
  //
  .add('query', async e => {
    const client = e.props.client;

    type IResponse = { json: { count: number; message: string; foo: object } };

    const res = await client.query<IResponse>({ query, fetchPolicy: 'network-only' });
    e.props.next({ res });

    log.info('count', res.data.json.count);
  })
  .add('mutate', async e => {
    const client = e.props.client;
    const msg = e.param(0, 'My mutated value');
    type IVariables = { msg: string };
    const res = await client.mutate<boolean, IVariables>({ mutation, variables: { msg } });
    e.props.next({ res });
  });
