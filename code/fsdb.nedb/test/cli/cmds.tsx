import { Command, gql, GraphqlClient, log, t } from '../common';

const client = GraphqlClient.create({
  uri: 'http://localhost:5000/graphql',
  fetchPolicy: 'network-only',
});

type P = t.ICommandProps;

const refresh = async (e: t.ICommandHandlerArgs<t.ICommandProps>) => {
  const db = e.props.db;
  const res = await db.find('**');
  e.props.state$.next({ docs: res.map });
};

/**
 * Sample commands.
 */
export const root = Command.create<P>('root', e => refresh(e))
  //
  .add('store', async e => {
    const store = e.props.store;
    const name = 'foo';
    const value = e.param(0, 'my-value');

    const res1 = await store.findOne({ name });
    log.info(`BEFORE insert`, res1);

    await store.insert({ name, value });

    const res2 = await store.findOne({ name });
    log.info(`AFTER insert`, res1);
  })

  .add('refresh', async e => {
    await refresh(e);
  })

  .add('put', async e => {
    const db = e.props.db;
    const value = (await db.getValue<number>('count')) || 0;
    await db.put('count', value + 1);
    await refresh(e);
  })

  .add('compact', async e => {
    const store = e.props.store;
    await store.compact();
  })

  .add('pull', async e => {
    const db = e.props.db;
    const query = gql`
      query Read {
        read
      }
    `;

    const res = await client.query({ query });
    const items = (res.data.read.items || []) as t.IDbValue[];

    await Promise.all(
      items.map(async item => {
        const { props, value } = item;
        const { key, createdAt, modifiedAt } = props;
        await db.put(key, value, { createdAt, modifiedAt });
      }),
    );
  });
