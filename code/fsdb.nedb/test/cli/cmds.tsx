import { log, Command, t, Nedb, gql, GraphqlClient } from '../common';

const client = GraphqlClient.create({
  uri: 'http://localhost:5000/graphql',
  fetchPolicy: 'network-only',
});

type P = t.ICommandProps;

/**
 * Sample commands.
 */
export const root = Command.create<P>('root')
  //
  .add('store', async e => {
    const db = e.props.db;
    const name = 'foo';
    const value = e.param(0, 'my-value');

    const res1 = await db.findOne({ name });
    log.info(`BEFORE insert`, res1);

    await db.insert({ name, value });

    const res2 = await db.findOne({ name });
    log.info(`AFTER insert`, res1);
  })

  .add('compact', async e => {
    const db = e.props.db;
    await db.compact();
  })

  .add('refresh', async e => {
    const doc = e.props.doc;

    // await doc.put('foo/bar', { msg: 'hello' });

    const res = await doc.find('**');
    const items = res.list;

    e.props.state$.next({ docs: res.map });
  })
  .add('pull', async e => {
    const db = e.props.doc;
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
