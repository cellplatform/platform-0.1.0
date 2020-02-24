import { t, expect, http, createMock, stripHashes, post, Schema, HttpClient } from '../test';

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
    const client = mock.client;

    const A: t.IColumnData = { props: { prop: { name: 'title', type: 'string' } } };

    await client.ns('foo').write({
      ns: {
        title: 'Hello',
        type: { typename: 'MySheet' },
      },
      columns: {
        A,
        B: { props: { prop: { name: 'isEnabled', type: 'boolean' } } },
        C: { props: { prop: { name: 'colors', type: '=ns:foo.colorName', inline: true } } }, // TEMP 🐷 list / inline
        // C: { props: { prop: { name: 'colors', type: '=ns:foo.colorName[]', inline: true } } }, // TODO 🐷 list([array]) / inline
      },
    });

    await client.ns('foo.colorName').write({
      ns: {
        type: { typename: 'ColorName' },
      },
      columns: {
        A: { props: { prop: { name: 'label', type: 'string' } } },
        B: { props: { prop: { name: 'color', type: '"red" | "green" | "blue"' } } },
      },
    });

    // const res2 = await mock.client.ns('foo').read({ data: true });

    console.log('-------------------------------------------');
    const url = mock.url('ns:foo/types');
    const res3 = await http.get(url);
    const json = res3.json as t.IResGetNsTypes;

    console.log('json.types', json.types);
    console.log('-------------------------------------------');
    console.log('json.types[2]', json.types[2].type);

    console.log('-------------------------------------------');
    // console.log('status', res3.status);
    // console.log(res3.json?.types);
    // console.log('Schema.uri.allow', Schema.uri.ALLOW);

    console.log('-------------------------------------------');
    console.log('');
    console.log(json.typescript);

    await mock.dispose();
  });

  //   it.skip('slc', async () => {
  //     const mock = await createMock();

  //     /**
  //      * TODO 🐷TESTS
  //      * - ref: not NS URI
  //      * - ref: not found (404)
  //      * - n-level deep type refs.
  //      * - circular ref safe on referenced type
  //      * - different types
  //      */

  //     /**
  //      * TODO 🐷 Features
  //      * - different scalar types
  //      * - handle enums (?)
  //      * - error check typename on NS upon writing (Captialised, no spaces)
  //      */

  //     //

  //     await mock.client.ns('foo.slc').write({
  //       ns: {
  //         title: 'SlcDef',
  //         type: { typename: 'Slc' },
  //       },
  //       columns: {
  //         A: { props: { prop: 'organization', type: 'string' } },
  //         B: { props: { prop: 'version', type: 'string' } },
  //         C: { props: { prop: 'project', type: '=ns:foo.slc.project' } },
  //       },
  //     });

  //     await mock.client.ns('foo.slc.project').write({
  //       ns: {
  //         type: { typename: 'SlcProject' },
  //       },
  //       columns: {
  //         A: { props: { prop: 'purpose', type: '=ns:foo.slc.panel' } },
  //         B: { props: { prop: 'impact', type: '=ns:foo.slc.panel' } },
  //         C: { props: { prop: 'problem', type: '=ns:foo.slc.panel' } },
  //         D: { props: { prop: 'solution', type: '=ns:foo.slc.panel' } },
  //         E: { props: { prop: 'metrics', type: '=ns:foo.slc.panel' } },
  //         F: { props: { prop: 'uvp', type: '=ns:foo.slc.panel' } },
  //         G: { props: { prop: 'advantage', type: '=ns:foo.slc.panel' } },
  //         H: { props: { prop: 'channels', type: '=ns:foo.slc.panel' } },
  //         I: { props: { prop: 'segments', type: '=ns:foo.slc.panel' } },
  //         J: { props: { prop: 'costs', type: '=ns:foo.slc.panel' } },
  //         K: { props: { prop: 'revenue', type: '=ns:foo.slc.panel' } },
  //       },
  //     });

  //     await mock.client.ns('foo.slc.panel').write({
  //       ns: {
  //         type: { typename: 'SlcPanel' },
  //       },
  //       columns: {
  //         A: { props: { prop: 'summary', type: 'string' } },
  //         B: { props: { prop: 'detail', type: 'string' } },
  //       },
  //     });

  //     // const res2 = await mock.client.ns('foo').read({ data: true });

  //     console.log('-------------------------------------------');
  //     // console.log('columns:\n', res2.body.data.columns);

  //     console.log('-------------------------------------------');
  //     const url = mock.url('ns:foo.slc/types');
  //     const res3 = await http.get(url);

  //     const json = res3.json as t.IResGetNsTypes;

  //     console.log('-------------------------------------------');
  //     // console.log('status', res3.status);
  //     // console.log(res3.json?.types);
  //     // console.log('Schema.uri.allow', Schema.uri.ALLOW);

  //     console.log('-------------------------------------------');
  //     console.log();
  //     console.log(json.typescript);

  //     await mock.dispose();
  //   });
});
