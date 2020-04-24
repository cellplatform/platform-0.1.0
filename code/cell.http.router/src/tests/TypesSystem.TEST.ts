import { fs, createMock, expect, http, t, TypeSystem, Client, ERROR } from '../test';
import * as g from './.d.ts/MyRow';

/**
 * NOTE:
 *    For a more comprehensive set of type decalration
 *    examples see module:
 *
 *          @platform/cell.typesystem
 *
 */
type SampleTypeDefs = { 'ns:foo': t.ITypeDefPayload; 'ns:foo.color': t.ITypeDefPayload };
const TYPE_DEFS: SampleTypeDefs = {
  'ns:foo': {
    columns: {
      A: { props: { def: { prop: 'MyRow.title', type: 'string', default: 'Untitled' } } },
      B: {
        props: {
          def: [
            { prop: 'MyRow.isEnabled', type: 'boolean', target: 'inline:isEnabled', default: true },
            { prop: 'MyOther.label', type: 'string', target: 'inline:other', default: 'Untitled' },
          ],
        },
      },
      C: {
        props: {
          def: { prop: 'MyRow.color', type: 'ns:foo.color/MyColor', target: 'inline:color' },
        },
      },
    },
  },

  'ns:foo.color': {
    columns: {
      A: { props: { def: { prop: 'MyColor.label', type: 'string' } } },
      B: { props: { def: { prop: 'MyColor.color', type: '"red" | "green" | "blue"' } } },
    },
  },
};

const writeTypes = async (client: t.IHttpClient) => {
  const write = async (ns: keyof SampleTypeDefs) => client.ns(ns).write(TYPE_DEFS[ns]);
  await write('ns:foo');
  await write('ns:foo.color');
  return { client };
};

describe('TypeSystem ➔ HTTP', () => {
  it('generate [.d.ts] file', async () => {
    const mock = await createMock();
    await writeTypes(mock.client);

    const type = Client.type({ http: mock.client });
    const ts = await type.typescript('ns:foo');
    await mock.dispose();

    const path = fs.join(__dirname, '.d.ts', 'MyRow.ts');
    await ts.save(fs, path);

    const file = (await fs.readFile(path)).toString();

    expect(file).to.include(`|➔  ns:foo`);
    expect(file).to.include(`export declare type MyRow = {`);
    expect(file).to.include(`export declare type MyOther = {`);
  });

  describe('TypeClient', () => {
    it('url: /ns:foo/types (404)', async () => {
      const mock = await createMock();
      // NB: No type data is written (allowing a 404 to be achieved).

      const res = await http.get(mock.url('ns:foo/types'));
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(404);

      const json = res.json as t.IHttpError;
      expect(json.status).to.eql(404);
      expect(json.type).to.eql(ERROR.HTTP.NOT_FOUND);
      expect(json.message).to.include(`Failed to retrieve type definitions for (ns:foo)`);
    });

    it('url: /ns:foo/types', async () => {
      const mock = await createMock();
      await writeTypes(mock.client);

      const res = await http.get(mock.url('ns:foo/types'));
      await mock.dispose();

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);

      const json = res.json as t.IResGetNsTypes;
      const types = json.types;

      expect(json.uri).to.eql('ns:foo');
      expect(types.length).to.eql(2);

      expect(types[0].typename).to.eql('MyRow');
      expect(types[0].columns.map(def => def.prop)).to.eql(['title', 'isEnabled', 'color']);

      expect(types[1].typename).to.eql('MyOther');
      expect(types[1].columns.map(def => def.prop)).to.eql(['label']);

      expect(json.typescript).to.include(`export declare type MyRow`);
      expect(json.typescript).to.include(`export declare type MyColor`);
      expect(json.typescript).to.include(`export declare type MyOther`);
    });
  });

  describe('TypedSheet', () => {
    const writeMySheetRows = async <T>(client: t.IHttpClient, rows?: T[]) => {
      const defs = (await TypeSystem.client(client).load('ns:foo')).defs;

      const items: any[] = rows || [
        { title: 'One', isEnabled: true, color: { label: 'background', color: 'red' } },
        { title: 'Two', isEnabled: false, color: { label: 'foreground', color: 'blue' } },
      ];

      const cells = TypeSystem.objectToCells<T>(defs[0]).rows(0, items);

      const ns = 'ns:foo.mySheet';
      await client.ns('foo.mySheet').write({
        ns: { type: { implements: 'ns:foo' } },
        cells,
      });

      return { ns, cells };
    };

    it('fetch from [http] server', async () => {
      const mock = await createMock();
      await writeTypes(mock.client);
      await writeMySheetRows(mock.client);

      const requests: string[] = [];
      mock.service.request$.subscribe(e => requests.push(e.url));

      const ns = 'ns:foo.mySheet';
      const sheet = await TypeSystem.Sheet.client(mock.client).load<g.MyRow>(ns);

      const cursor = await sheet.data('MyRow').load();
      await mock.dispose();

      expect(requests.some(url => url === '/ns:foo')).to.eql(true);
      expect(requests.some(url => url === '/ns:foo.color')).to.eql(true);
      expect(requests.some(url => url === '/ns:foo.mySheet')).to.eql(true);

      expect(cursor.uri.toString()).to.eql(ns);
      const row1 = cursor.row(0);
      const row2 = cursor.row(1);

      expect(row1).to.not.eql(undefined);
      expect(row2).to.not.eql(undefined);

      if (row1) {
        expect(row1.props.title).to.eql('One');
        expect(row1.props.isEnabled).to.eql(true);
        expect(row1.props.color).to.eql({ label: 'background', color: 'red' });
      }

      if (row2) {
        expect(row2.props.title).to.eql('Two');
        expect(row2.props.isEnabled).to.eql(false);
        expect(row2.props.color).to.eql({ label: 'foreground', color: 'blue' });
      }
    });

    it('from [Client]', async () => {
      const mock = await createMock();
      await writeTypes(mock.client);
      await writeMySheetRows(mock.client);

      const requests: string[] = [];
      mock.service.request$.subscribe(e => requests.push(e.url));

      const ns = 'ns:foo.mySheet';
      const typesystem = Client.type({ http: mock.client });
      expect(typesystem.http).to.eql(mock.client);

      const sheet = await typesystem.sheet<g.MyRow>(ns);
      const cursor = await sheet.data('MyRow').load();
      const row = cursor.row(0).props;

      await mock.dispose();

      expect(sheet.types.map(def => def.typename)).to.eql(['MyRow', 'MyOther']);
      expect(row.title).to.eql('One');
    });

    it.skip('sync to [http] server', async () => {
      //
    });
  });
});
