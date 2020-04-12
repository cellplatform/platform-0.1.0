import { fs, createMock, expect, http, t, TypeSystem, Client } from '../test';
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
    ns: { type: { typename: 'MyRow' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string', default: 'Untitled' } } },
      B: { props: { prop: { name: 'isEnabled', type: 'boolean', target: 'inline:isEnabled' } } },
      C: {
        props: { prop: { name: 'color', type: 'ns:foo.color', target: 'inline:color' } },
      },
    },
  },

  'ns:foo.color': {
    ns: { type: { typename: 'MyColor' } },
    columns: {
      A: { props: { prop: { name: 'label', type: 'string' } } },
      B: { props: { prop: { name: 'color', type: '"red" | "green" | "blue"' } } },
    },
  },
};

const writeTypes = async (client: t.IHttpClient) => {
  await client.ns('foo').write(TYPE_DEFS['ns:foo']);
  await client.ns('foo.color').write(TYPE_DEFS['ns:foo.color']);
  return { client };
};

describe('TypeSystem ➔ HTTP', () => {
  it('generate [.d.ts] file', async () => {
    const mock = await createMock();
    await writeTypes(mock.client);

    const type = Client.type({ client: mock.client });
    const ts = await type.typescript('ns:foo');

    await mock.dispose();

    const dir = fs.join(__dirname, '.d.ts');
    await ts.save(fs, dir);
  });

  describe('TypeClient', () => {
    it('url: /ns:foo/types', async () => {
      const mock = await createMock();
      await writeTypes(mock.client);

      const url = mock.url('ns:foo/types');
      const res = await http.get(url);
      await mock.dispose();

      const json = res.json as t.IResGetNsTypes;
      const types = json.types;

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);

      expect(json.uri).to.eql('ns:foo');
      expect(types.map(def => def.column)).to.eql(['A', 'B', 'C']);

      expect(types[0].column).to.eql('A');
      expect(types[0].prop).to.eql('title');
      expect((types[0].default as t.ITypeDefaultValue).value).to.eql('Untitled');

      const type = types[0].type as t.ITypeValue;
      expect(type.kind).to.eql('VALUE');
      expect(type.typename).to.eql('string');
    });
  });

  describe('TypedSheet', () => {
    const writeMySheetRows = async <T>(client: t.IHttpClient, rows?: T[]) => {
      const def = await TypeSystem.client(client).load('ns:foo');

      const items: any[] = rows || [
        { title: 'One', isEnabled: true, color: { label: 'background', color: 'red' } },
        { title: 'Two', isEnabled: false, color: { label: 'foreground', color: 'blue' } },
      ];

      const cells = TypeSystem.objectToCells<T>(def).rows(0, items);

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

      const cursor = await sheet.cursor().load();
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
      const typesystem = Client.type({ client: mock.client });
      expect(typesystem.http).to.eql(mock.client);

      const sheet = await typesystem.sheet<g.MyRow>(ns);
      const cursor = await sheet.cursor().load();
      const row = cursor.row(0).props;

      await mock.dispose();

      expect(sheet.types.map(def => def.column)).to.eql(['A', 'B', 'C']);
      expect(row.title).to.eql('One');
    });

    it.skip('sync to [http] server', async () => {
      //
    });
  });
});
