import { t, expect, http, createMock, stripHashes, post } from '../test';

describe.only('type system', () => {
  it('sample', async () => {
    const mock = await createMock();

    const A: t.IColumnData = { props: { name: 'title', type: 'string' } };
    const B: t.IColumnData = { props: { name: 'color', type: 'string' } };
    const C: t.IColumnData = { props: { name: 'isEnabled', type: 'boolean' } };

    //
    // mock.url()
    const res1 = await mock.client.ns('foo').write({
      ns: { name: 'foo' },
      columns: { A, B, C },
    });
    const res2 = await mock.client.ns('foo').read({ data: true });

    console.log('-------------------------------------------');
    console.log('columns:\n', res2.body.data.columns);

    const url = mock.url('ns:foo/types.d.ts');
    const res3 = await http.get(url);

    console.log('-------------------------------------------');
    console.log('status', res3.status);
    console.log('res3.text', res3.json);

    await mock.dispose();
  });
});

export type Foo = {
  title: string;
  color: string;
  isEnabled: boolean;
};
