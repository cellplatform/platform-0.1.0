import { t, expect, http, createMock, stripHashes, post, constants } from '../test';
import { testPostFile } from './file.TEST';

/**
 * TODO 🐷
 * Tests for:
 * - FUNC: A1 references A2 stores value, the changes to REF =A3 (but does not exist) - value not reset.
 * - Remove Cell from NS
 */

describe('ns:', function() {
  this.timeout(20000);

  describe('invalid URI', () => {
    it('malformed: no id', async () => {
      const mock = await createMock();
      const url = mock.url('/ns:');
      const res = await http.get(url);
      const body = res.json as any;

      await mock.dispose();

      expect(res.status).to.eql(400);
      expect(body.error.type).to.eql('HTTP/uri/malformed');
      expect(body.error.message).to.contain('Malformed');
      expect(body.error.message).to.contain('does not contain an ID');
    });
  });

  describe('redirects', () => {
    it('redirects from "ns:" to "cell:" end-point', async () => {
      const test = async (path: string) => {
        const mock = await createMock();
        await mock.client.ns('foo').write({ cells: { A1: { value: 'hello' } } }); // NB: Force A1 into existence in DB.
        const res = await http.get(mock.url(path));
        const json = res.json as t.IResGetCell;

        await mock.dispose();

        expect(res.status).to.eql(200);
        expect(json.exists).to.eql(true);
        expect(json.uri).to.eql('cell:foo:A1'); // NB: The "cell:" URI, not "ns:".
        expect(json.data.value).to.eql('hello');
      };

      await test('/ns:foo:A1');
      await test('/ns:foo:A1/');
      await test('/ns:foo:A1?cells');
    });
  });

  describe('GET', () => {
    it('does not exist (404)', async () => {
      const mock = await createMock();
      const url = mock.url('ns:foo');
      const res = await http.get(url);
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(404);

      const body = res.json as t.IResGetNs;
      const ns = body.data.ns;

      expect(body.uri).to.eql('ns:foo');
      expect(body.exists).to.eql(false);
      expect(body.createdAt).to.eql(-1);
      expect(body.modifiedAt).to.eql(-1);

      expect(ns.id).to.eql('foo');
      expect(ns.hash).to.eql('-'); // NB: default when does not exist.

      // NB: No cell data by default (requires query-string).
      expect(body.data.cells).to.eql(undefined);
      expect(body.data.rows).to.eql(undefined);
      expect(body.data.columns).to.eql(undefined);
    });

    it('supported namespace ID characters', async () => {
      const mock = await createMock();

      const test = async (ns: string) => {
        const client = mock.client.ns(ns);
        await client.write({ ns: { title: 'hello' } });
        const res = await client.read();
        expect(res.status).to.eql(200);
        expect(res.body.data.ns.props?.title).to.eql('hello');
      };

      // NB: period only allowed by [Schema.uri.ALLOW.NS] - setup in local tests.
      await test('foo');
      await test('foo.bar');

      await mock.dispose();
    });

    it('retains [null] values', async () => {
      const mock = await createMock();

      const payload: t.IReqPostNsBody = {
        cells: { A1: { value: 'hello', props: null } } as any, // NB: [any] because `null` is an illegal type.
        rows: { 1: { props: null } } as any,
        columns: { A: { props: null } } as any,
      };
      await http.post(mock.url('ns:foo'), payload);

      const url = mock.url('ns:foo?data');
      const res = await http.get(url);
      await mock.dispose();

      const json = res.json as any;
      stripHashes(json.data); // NB: Ignore calculated hash values for the purposes of this test.

      expect(json.data.cells).to.eql({ A1: { value: 'hello', props: null } });
      expect(json.data.rows).to.eql({ 1: { props: null } });
      expect(json.data.columns).to.eql({ A: { props: null } });
    });

    it('squashes [undefined] values', async () => {
      const mock = await createMock();

      const payload: t.IReqPostNsBody = {
        cells: { A1: { value: 'hello', props: undefined } } as any,
        rows: { 1: { props: undefined } } as any,
        columns: { A: { props: undefined } } as any,
      };
      await http.post(mock.url('ns:foo'), payload);

      const url = mock.url('ns:foo?data');
      const res = await http.get(url);
      await mock.dispose();

      const json = res.json as any;
      stripHashes(json.data); // NB: Ignore calculated hash values for the purposes of this test.

      expect(json.data.cells).to.eql({ A1: { value: 'hello' } });
      expect(json.data.rows).to.eql({});
      expect(json.data.columns).to.eql({});
    });

    it('selective data via query-string (boolean|ranges)', async () => {
      const mock = await createMock();

      const A1 = { value: 'A1' };
      const B2 = { value: 'B2' };
      const B9 = { value: 'B9' };
      const C4 = { value: 'C4' };
      const C5 = { value: 'C5' };
      const cells = { A1, B2, B9, C4, C5 };

      const columns = {
        A: { props: { height: 80 } },
        C: { props: { height: 120 } },
      };
      const rows = {
        1: { props: { width: 350 } },
        3: { props: { width: 256 } },
      };

      const body: t.IReqPostNsBody = { cells, columns, rows };
      await http.post(mock.url('ns:foo'), body);

      const test = async (path: string, expected?: any) => {
        const url = mock.url(path);
        const res = await http.get(url);

        // Prepare a subset of the return data to compare with expected result-set.
        const json = (res.json as t.IResGetNs).data;
        delete json.ns;
        stripHashes(json); // NB: Ignore calculated hash values for the purposes of this test.
        expect(json).to.eql(expected);
      };

      await test('ns:foo', {});
      await test('ns:foo?cells=false&rows=false&columns=false', {}); // Same as default (line above).

      await test('ns:foo?cells', { cells });
      await test('ns:foo?cells=true', { cells });
      await test('ns:foo?cells=A1', { cells: { A1: cells.A1 } });
      await test('ns:foo?cells=A1:B10', { cells: { A1, B2, B9 } });
      await test('ns:foo?cells=A1:Z4', { cells: { A1, B2, C4 } });
      await test('ns:foo?cells=A1:Z10', { cells: { A1, B2, B9, C4, C5 } });
      await test('ns:foo?cells=A1,B1:B10&cells=C9', { cells: { A1, B2, B9 } }); // NB: C9 does not exist.
      await test('ns:foo?cells=A1:Z9', { cells });

      await test('ns:foo?rows', { rows });
      await test('ns:foo?rows=true', { rows });
      await test('ns:foo?rows=1', { rows: { 1: rows['1'] } });
      await test('ns:foo?rows=1:2', { rows: { 1: rows['1'] } });
      await test('ns:foo?rows=1:9', { rows });
      await test('ns:foo?rows=1,2:5', { rows });
      await test('ns:foo?rows=2:5', { rows: { 3: rows['3'] } });

      await test('ns:foo?columns', { columns });
      await test('ns:foo?columns=true', { columns });
      await test('ns:foo?columns=A', { columns: { A: columns.A } });
      await test('ns:foo?columns=A:B', { columns: { A: columns.A } });
      await test('ns:foo?columns=A:D', { columns });
      await test('ns:foo?columns=B:D', { columns: { C: columns.C } });
      await test('ns:foo?columns=B:D,A', { columns });

      await test('ns:foo?cells&rows&columns', body);

      const data = { ...body, files: {} };
      await test('ns:foo?data', data);
      await test('ns:foo?data=true', data);
      await test('ns:foo?data=false', {});

      await mock.dispose();
    });

    it('files via query-string', async () => {
      const mock = await createMock();
      const post = await testPostFile({
        source: 'src/test/assets/bird.png',
        dispose: false,
        mock,
      });

      const res1 = await http.get(mock.url('ns:foo'));
      const res2 = await http.get(mock.url('ns:foo?files'));
      await mock.dispose();

      const json1 = (res1.json as t.IResGetNs).data;
      const json2 = (res2.json as t.IResGetNs).data;

      expect(json1.files).to.eql(undefined);

      const filename = post.fileUri.split(':')[2];
      const file = (json2.files && json2.files[filename]) as t.IFileData;
      expect(file.props).to.eql(post.file?.props);
    });

    it('versions', async () => {
      const mock = await createMock();
      const client = mock.client.ns('foo');

      const cells: t.ICellMap<t.ICellData> = {
        A1: { value: 123 },
      };
      const res = await client.write({ cells }, { cells: true });
      const ns = res.body.data.ns;
      await mock.dispose();

      const versions = constants.getVersions();
      const schemaVersion = versions.toVersion(versions.schema);
      expect(ns.props?.schema).to.eql(schemaVersion);
    });
  });

  describe('GET totals', () => {
    it('no total object', async () => {
      const mock = await createMock();
      const client = mock.client.ns('foo');
      const cells: t.ICellMap<t.ICellData> = {
        A1: { value: 123 },
      };

      await client.write({ cells });
      const res1 = await client.read({ data: true });
      const res2 = await client.read({ data: true, total: false });
      await mock.dispose();

      expect(res1.body.data.total).to.eql(undefined);
      expect(res2.body.data.total).to.eql(undefined);
    });

    it('total: rows/columns', async () => {
      const mock = await createMock();
      const client = mock.client.ns('foo');
      const cells: t.ICellMap<t.ICellData> = {
        Z9: { value: 123 },
      };

      await client.write({ cells });
      const res = await client.read({ total: ['rows', 'columns', 'rows'] }); // NB: de-duped.
      const total = res.body.data.total;

      expect(total?.cells).to.eql(1);
      expect(total?.columns).to.eql(26);
      expect(total?.rows).to.eql(9);
      expect(total?.files).to.eql(undefined);

      await mock.dispose();
    });

    it('total: true (all)', async () => {
      const mock = await createMock();
      const client = mock.client.ns('foo');
      const cells: t.ICellMap<t.ICellData> = {
        Z9: { value: 123 },
      };
      await client.write({ cells });
      await testPostFile({
        source: 'src/test/assets/bird.png',
        dispose: false,
        mock,
      });

      const res = await client.read({ cells: true, total: true });
      const total = res.body.data.total;

      expect(total?.cells).to.eql(2); // NB: "A1" (file holder) and "Z9".
      expect(total?.columns).to.eql(26);
      expect(total?.rows).to.eql(9);
      expect(total?.files).to.eql(1);

      await mock.dispose();
    });
  });

  describe('POST', () => {
    it('data (?changes=false)', async () => {
      const { res, json, data } = await post.ns('ns:foo?cells&changes=false', {
        cells: { A1: { value: 'hello' } },
      });
      const cells = data.cells || {};

      expect(res.status).to.eql(200);
      expect(json.uri).to.eql('ns:foo');
      expect(json.exists).to.eql(true); // NB: Model exists after first save.
      expect(json.createdAt).to.not.eql(-1);
      expect(json.modifiedAt).to.not.eql(-1);
      expect(json.changes).to.eql(undefined);

      expect(data.ns.id).to.eql('foo');
      expect(data.ns.hash).to.not.eql('-'); // NB: hash calculation tested seperately.
      expect(cells.A1 && cells.A1.value).to.eql('hello');
      expect(data.rows).to.eql(undefined);
      expect(data.columns).to.eql(undefined);
    });

    it('data with changes (default: ?changes=true)', async () => {
      const { json } = await post.ns('ns:foo?cells', {
        cells: { A1: { value: 'hello' } },
      });

      const changes = json.changes || [];
      expect(changes.length).to.eql(5);
      expect(changes.map(c => c.field)).to.eql(['value', 'hash', 'id', 'props', 'hash']);

      const change = changes[0];
      expect(change.uri).to.eql('cell:foo:A1');
      expect(change.field).to.eql('value');
      expect(change.from).to.eql(undefined);
      expect(change.to).to.eql('hello');
    });

    it('namespace props ("name", etc)', async () => {
      const res1 = await post.ns('ns:foo?ns', {});
      expect(res1.data.ns.hash).to.eql('-');
      expect(res1.data.ns.id).to.eql('foo');
      expect(res1.data.ns.props).to.eql(undefined);

      const res2 = await post.ns('ns:foo?ns', { ns: { title: 'MySheet' } });

      expect(res2.data.ns.hash).to.not.eql(res1.data.ns.hash); // Hash updated.
      expect((res2.data.ns.props || {}).title).to.eql('MySheet');

      const res3 = await post.ns('ns:foo?ns', { ns: { title: undefined } });
      expect(res3.data.ns.hash).to.not.eql(res2.data.ns.hash); // Hash updated.
      expect(res3.data.ns.props).to.eql(undefined); // NB: Squashed.
    });
  });

  describe('POST hash updates (SHA256)', () => {
    it('generate namespace hash', async () => {
      const res = await post.ns('ns:foo?cells', { cells: { A1: { value: 123 } } });
      const hash = res.data.ns.hash;
      expect(hash).to.match(/^sha256-/);
      expect(hash && hash.length).to.greaterThan(20);
    });

    it('recalculate hash on namespace (ns props changed)', async () => {
      const res1 = await post.ns('ns:foo?cells', { ns: { title: 'hello world' } });
      expect(res1.data.ns.hash).to.match(/^sha256-/);

      const res2 = await post.ns('ns:foo?cells', { cells: { A1: { value: 124 } } });
      expect(res2.data.ns.hash).to.match(/^sha256-/);
      expect(res1.data.ns.hash).to.not.eql(res2.data.ns.hash);
    });

    it('recalculate hashes on cells', async () => {
      const res1 = await post.ns('ns:foo?cells', { cells: { A1: { value: 123 } } });
      const res2 = await post.ns('ns:foo?cells', { cells: { A1: { value: 124 } } });
      const cells1 = res1.data.cells || {};
      const cells2 = res2.data.cells || {};
      expect(cells1.A1 && cells1.A1.hash).to.not.eql(cells2.A1 && cells2.A1.hash);
    });

    it('recalculate hashes on rows', async () => {
      const res1 = await post.ns('ns:foo?rows', { rows: { 1: { props: { height: 60 } } } });
      const res2 = await post.ns('ns:foo?rows', { rows: { 1: { props: { height: 61 } } } });
      const rows1 = res1.data.rows || {};
      const rows2 = res2.data.rows || {};
      expect(rows1['1'] && rows1['1'].hash).to.not.eql(rows2['1'] && rows2['1'].hash);
    });

    it('recalculate hashes on columns', async () => {
      const res1 = await post.ns('ns:foo?columns', { columns: { A: { props: { width: 160 } } } });
      const res2 = await post.ns('ns:foo?columns', { columns: { A: { props: { width: 161 } } } });
      const cols1 = res1.data.columns || {};
      const cols2 = res2.data.columns || {};
      expect(cols1.A && cols1.A.hash).to.not.eql(cols2.A && cols2.A.hash);
    });
  });

  describe('POST calculate', () => {
    it('REF', async () => {
      const cells = {
        A1: { value: '=A2' },
        A2: { value: '123' },
      };

      const res1 = await post.ns('ns:foo?cells', { cells }); // Default: calc=false
      const res2 = await post.ns('ns:foo?cells', { cells, calc: true });
      const res3 = await post.ns('ns:foo?cells', { cells, calc: false });

      const cells1 = res1.data.cells || {};
      const cells2 = res2.data.cells || {};

      const A1a = cells1.A1 || {};
      const A1b = cells2.A1 || {};

      expect(A1a.props).to.eql(undefined);
      expect(A1b.props && A1b.props.value).to.eql('123'); // NB: calculated REF value of A2.
      expect(A1a.hash).to.not.eql(A1b.hash); // NB: Hashes differ.
      expect(res3.data).to.eql(res1.data); // No calcuation.
    });

    it('REF re-calculate when referenced value changes', async () => {
      const mock = await createMock();
      let cells = {
        A1: { value: '=A2' },
        A2: { value: 123 },
      };
      const res1 = await post.ns('ns:foo?cells', { cells, calc: true }, { mock });

      cells = { ...cells, A2: { value: 456 } };
      const res2 = await post.ns('ns:foo?cells', { cells, calc: true }, { mock });

      await mock.dispose();

      const cells1 = res1.data.cells || {};
      const cells2 = res2.data.cells || {};
      const A1a = cells1.A1 || {};
      const A1b = cells2.A1 || {};

      expect(A1a.props && A1a.props.value).to.eql(123); // NB: calculated REF value of A2.
      expect(A1b.props && A1b.props.value).to.eql(456); // NB: re-calculated REF value of A2.
      expect(A1a.hash).to.not.eql(A1b.hash); // NB: Hashes differ.
    });

    it('calc (operate on provided "range" subset of keys)', async () => {
      const mock = await createMock();
      const before = {
        A1: { value: '=A2' },
        A2: { value: 123 },
        B1: { value: '=A2' },
        C1: { value: '=Z9' },
        D1: { value: '=A1' },
        Z9: { value: 'hello' },
      };

      const res = await post.ns('ns:foo?cells', { cells: before, calc: 'A1:B9,D' }, { mock }); // NB: C1 not included.
      const after = res.data.cells || {};

      await mock.dispose();

      expect((after.A1 || {}).props).to.eql({ value: 123 });
      expect((after.A2 || {}).props).to.eql(undefined); // NB: simple value.
      expect((after.B1 || {}).props).to.eql({ value: 123 });
      expect((after.C1 || {}).props).to.eql(undefined); // NB: Excluded from calculation.
      expect((after.D1 || {}).props).to.eql({ value: 123 });
      expect((after.Z9 || {}).props).to.eql(undefined); // NB: simple value.
    });

    it('calculate prior uncalculated set of data (calc=true)', async () => {
      const mock = await createMock();
      const cells = {
        A1: { value: '=A2' },
        A2: { value: 123 },
      };
      const res1 = await post.ns('ns:foo?cells', { cells }, { mock }); // NB: calc=false (default).
      const res2 = await post.ns('ns:foo?cells', { calc: true }, { mock });

      await mock.dispose();

      const cells1 = res1.data.cells || {};
      const cells2 = res2.data.cells || {};
      const A1a = cells1.A1 || {};
      const A1b = cells2.A1 || {};

      expect(A1a.props).to.eql(undefined);
      expect(A1b.props && A1b.props.value).to.eql(123);
    });

    it('calculate prior uncalculated set of data (calc=<range>)', async () => {
      const mock = await createMock();
      const before = {
        A1: { value: '=A2' },
        A2: { value: 123 },
        B1: { value: '=A2' },
        C1: { value: '=Z9' },
        D1: { value: '=A1' },
        Z9: { value: 'hello' },
      };

      await post.ns('ns:foo?cells', { cells: before, calc: false }, { mock }); // NB: calc=false (default).
      const res = await post.ns('ns:foo?cells', { calc: 'A1:B9,D' }, { mock });
      const after = res.data.cells || {};

      await mock.dispose();

      expect((after.A1 || {}).props).to.eql({ value: 123 });
      expect((after.A2 || {}).props).to.eql(undefined); // NB: simple value.
      expect((after.B1 || {}).props).to.eql({ value: 123 });
      expect((after.C1 || {}).props).to.eql(undefined); // NB: Excluded from calculation.
      expect((after.D1 || {}).props).to.eql({ value: 123 });
      expect((after.Z9 || {}).props).to.eql(undefined); // NB: simple value.
    });

    it('reports error when function not found', async () => {
      const mock = await createMock();
      const cells = {
        A1: { value: '=A2 + 5' }, // NB: The SUM function is not available.
        A2: { value: 123 },
      };

      const res = await post.ns('ns:foo?cells', { cells, calc: true }, { mock });

      await mock.dispose();

      const A1 = (res.data.cells || {}).A1 || {};
      const error = A1.error;

      expect(A1.props).to.eql(undefined);
      expect(error && error.type).to.match(/^FUNC\//);
      expect(error && error.message).to.contain(`operator '+' is not mapped`);
    });

    it('clears error when function is corrected', async () => {
      const mock = await createMock();
      const cells = {
        A1: { value: '=A2 + 5' }, // NB: The SUM function is not available.
        A2: { value: 123 },
      };

      const res1 = await post.ns('ns:foo?cells', { cells, calc: true }, { mock });
      cells.A1.value = '=A2'; // Remove function, clearing error.

      const res2 = await post.ns('ns:foo?cells', { cells, calc: true }, { mock });

      await mock.dispose();

      const A1a = (res1.data.cells || {}).A1 || {};
      const A1b = (res2.data.cells || {}).A1 || {};
      const error1 = A1a.error;
      const error2 = A1b.error;

      expect(A1a.props).to.eql(undefined);
      expect(A1b.props).to.eql({ value: 123 });

      expect(error1 && error1.type).to.match(/^FUNC\//);
      expect(error2).to.eql(undefined);
    });

    it.skip('calculates SUM from imported func', async () => {
      const mock = await createMock();
      const cells = {
        A1: { value: '=10 + A2', links: {} },
        A2: { value: 123 },
      };

      const res = await post.ns('ns:foo?cells', { cells, calc: true }, { mock });
      await mock.dispose();

      const A1 = (res.data.cells || {}).A1 || {};

      console.log('-------------------------------------------');
      // console.log('res1', res.json);
      console.log('-------------------------------------------');
      console.log('A1', A1);
    });
  });
});
