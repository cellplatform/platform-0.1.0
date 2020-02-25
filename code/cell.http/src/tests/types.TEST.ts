// import './types.foo';
import * as g from './.d.ts/MySheet';

import { fs, t, expect, http, createMock, stripHashes, post, Schema, HttpClient } from '../test';
import { TypeSystem } from '../TypeSystem';

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
 * - return [total] from server for cells (on ns?).
 * - ns (read): query on subset of rows (index/take)
 * - ns (read): query string {ns:false} - omit ns data.
 * - change handler (pending => save)
 * - read/write: linked sheet
 * - save types (abstract FS)
 */

const writeData = async (args: { client: t.IHttpClient }) => {
  const { client } = args;

  const A: t.IColumnData = { props: { prop: { name: 'title', type: 'string' } } };

  await client.ns('foo').write({
    ns: {
      title: 'Hello',
      type: { typename: 'MySheet' },
    },
    columns: {
      A,
      B: { props: { prop: { name: 'isEnabled', type: 'boolean', target: 'inline:isEnabled' } } },
      C: {
        props: { prop: { name: 'colors', type: '=ns:foo.colorSetting', target: 'inline:foo' } },
      },
      // TEMP 🐷 list / inline
      // C: { props: { prop: { name: 'colors', type: '=ns:foo.colorSetting[]', inline: true } } }, // TODO 🐷 list([array]) / inline
    },
  });

  /**
   * TODO: target
   * inline:value
   * inline:<prop>.<prop>
   * ref
   */

  await client.ns('foo.colorSetting').write({
    ns: {
      type: { typename: 'ColorSetting' },
    },
    columns: {
      A: { props: { prop: { name: 'label', type: 'string' } } },
      B: { props: { prop: { name: 'color', type: '"red" | "green" | "blue"' } } },
    },
  });

  return { client };
};

describe.only('type system', () => {
  it('sample', async () => {
    //
    const mock = await createMock();
    const client = mock.client;

    await writeData({ client });

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

  it.only('Sheet (typed)', async () => {
    const mock = await createMock();
    const client = mock.client;
    await writeData({ client });

    await client.ns('foo.mySheet').write({
      ns: {
        type: { implements: 'foo' },
      },
      cells: {
        A1: { value: 'One' },
        B1: { props: { isEnabled: true } },
        C1: { props: { foo: { label: 'background', color: 'red' } } },
        A2: { value: 'Two' },
        B2: { props: { isEnabled: false } },
        C2: { props: { foo: { label: 'background', color: 'green' } } },
      },
    });

    // const fetch = fetcher.fromClient({ client });
    // const sheet = await TypedSheet.load<g.MySheet>({ fetch, ns: 'foo.mySheet' });
    const sheet = await TypeSystem.Sheet.fromClient(client).load<g.MySheet>('foo.mySheet');
    const cursor = await sheet.cursor({ index: -5 });

    // console.log('rows', rows);

    // console.log('cursor.row(0).title', cursor.row(0)?.title);

    const row = cursor.row(0);

    if (row) {
      console.log('-------------------------------------------');
      console.log('title', row.title);
      console.log('-------------------------------------------');
      console.log('isEnabled', row.isEnabled);
    }

    await mock.dispose();

    console.log('-------------------------------------------');

    const dir = fs.join(__dirname, '.d.ts');
    const saved = await sheet.type.save({ dir, fs });
    console.log('saved to:', saved.path);
  });
});
