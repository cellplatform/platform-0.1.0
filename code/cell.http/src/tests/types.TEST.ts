import { t, expect, http, createMock, stripHashes, post, Schema } from '../test';

describe.only('type system', () => {
  it('sample', async () => {
    const mock = await createMock();

    /**
     * TODO 🐷TESTS
     * - ref: not NS URI
     * - ref: not found (404)
     * - n-level deep type refs.
     * - circular ref safe on referenced type
     * - different types
     */

    /**
     * TODO 🐷 Features
     * - different scalar types
     * - handle enums (?)
     * - error check typename on NS upon writing (Captialised, no spaces)
     */

    //

    await mock.client.ns('foo').write({
      ns: {
        title: 'My Title',
        type: { typename: 'MySheet' },
      },
      columns: {
        A: { props: { typename: 'title', type: 'string' } },
        B: { props: { typename: 'isEnabled', type: 'boolean' } },
        C: { props: { typename: 'obj', type: '=ns:foo.bar' } },
      },
    });

    await mock.client.ns('foo.bar').write({
      ns: {
        type: { typename: 'FooBar' },
      },
      columns: {
        A: { props: { typename: 'label', type: 'string' } },
        B: { props: { typename: 'color', type: '"red" | "green" | "blue"' } },
      },
    });

    // const res2 = await mock.client.ns('foo').read({ data: true });

    console.log('-------------------------------------------');
    // console.log('columns:\n', res2.body.data.columns);

    console.log('-------------------------------------------');
    const url = mock.url('ns:foo/types');
    const res3 = await http.get(url);

    console.log('-------------------------------------------');
    // console.log('status', res3.status);
    // console.log('res3.text', res3.json);
    // console.log('Schema.uri.allow', Schema.uri.ALLOW);

    await mock.dispose();
  });
});
