import { t, expect, http, createMock, stripHashes, post } from '../../test';

/**
 * TODO 🐷
 * - query: hash (optional)
 * - refactor hash (lazy eval)
 * - POST: changes (optional flag)
 * - calculations on POST
 */

describe('route: namespace', () => {
  describe('invalid URI', () => {
    it('malformed: no id', async () => {
      const mock = await createMock();
      const url = mock.url('/ns:');
      const res = await http.get(url);
      await mock.dispose();

      expect(res.status).to.eql(400);

      const body = res.json();
      expect(body.error.type).to.eql('HTTP/uri/malformed');
      expect(body.error.message).to.contain('Malformed');
      expect(body.error.message).to.contain('does not contain an ID');
    });
  });

  describe('POST', () => {
    it('POST data', async () => {
      const { res, json, data } = await post.ns('ns:foo?cells', {
        cells: { A1: { value: 'hello' } },
      });
      const cells = data.cells || {};

      expect(res.status).to.eql(200);
      expect(json.uri).to.eql('ns:foo');
      expect(json.exists).to.eql(true); // NB: Model exists after first save.
      expect(json.createdAt).to.not.eql(-1);
      expect(json.modifiedAt).to.not.eql(-1);
      expect(data.ns.id).to.eql('foo');
      expect(data.ns.hash).to.not.eql('-'); // NB: hash calculation tested seperately.
      expect(cells.A1 && cells.A1.value).to.eql('hello');
      expect(data.rows).to.eql(undefined);
      expect(data.columns).to.eql(undefined);

      expect(json.changes.length).to.eql(4);
      expect(json.changes.map(c => c.field)).to.eql(['value', 'hash', 'id', 'hash']);

      const change = json.changes[0];
      expect(change.uri).to.eql('cell:foo!A1');
      expect(change.field).to.eql('value');
      expect(change.from).to.eql(undefined);
      expect(change.to).to.eql('hello');
    });

    it('POST namespace props ("name", etc)', async () => {
      const res1 = await post.ns('ns:foo?ns', {});
      expect(res1.data.ns.hash).to.eql('-');
      expect(res1.data.ns.id).to.eql('foo');
      expect(res1.data.ns.props).to.eql(undefined);

      const res2 = await post.ns('ns:foo?ns', { ns: { name: 'MySheet' } });

      expect(res2.data.ns.hash).to.not.eql(res1.data.ns.hash); // Hash updated.
      expect((res2.data.ns.props || {}).name).to.eql('MySheet');

      const res3 = await post.ns('ns:foo?ns', { ns: { name: undefined } });
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

    it('recalculate hash on namespace (cells changed)', async () => {
      const res1 = await post.ns('ns:foo?cells', { cells: { A1: { value: 123 } } });
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
    it('REF calculations', async () => {
      const cells = {
        A1: { value: '=A2' },
        A2: { value: '123' },
      };
      const res1 = await post.ns('ns:foo?cells', { cells }); // Default: calc=false
      const res2 = await post.ns('ns:foo?cells', { cells, calc: true });

      const cells1 = res1.data.cells || {};
      const cells2 = res2.data.cells || {};

      const A1a = cells1.A1 || {};
      const A1b = cells2.A1 || {};

      expect(A1a.props).to.eql(undefined);
      expect(A1b.props && A1b.props.value).to.eql('123'); // NB: calculated REF value of A2.
      expect(A1a.hash).to.not.eql(A1b.hash); // NB: Hashes differ.
    });
  });

  describe('GET', () => {
    it('GET does not exist', async () => {
      const mock = await createMock();
      const url = mock.url('ns:foo');
      const res = await http.get(url);
      await mock.dispose();

      expect(res.status).to.eql(200);

      const body = res.json<t.IGetNsResponse>();
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

    it('GET squashes null values', async () => {
      const mock = await createMock();

      const payload: t.IPostNsBody = {
        cells: { A1: { value: 'hello', props: null } } as any, // NB: [any] because `null` is an illegal type.
        rows: { 1: { props: null } } as any,
        columns: { A: { props: null } } as any,
      };
      await http.post(mock.url('ns:foo'), payload);

      const url = mock.url('ns:foo/data');
      const res = await http.get(url);
      await mock.dispose();

      const json = res.json();
      stripHashes(json.data); // NB: Ignore calculated hash values for the purposes of this test.

      expect(json.data.cells).to.eql({ A1: { value: 'hello' } });
      expect(json.data.rows).to.eql({});
      expect(json.data.columns).to.eql({});
    });

    it('GET selective data via query-string (boolean|ranges)', async () => {
      const mock = await createMock();
      const cells = {
        A1: { value: 'A1' },
        B2: { value: 'B2' },
        C1: { value: 'C1' },
      };
      const columns = {
        A: { props: { height: 80 } },
        C: { props: { height: 120 } },
      };
      const rows = {
        1: { props: { width: 350 } },
        3: { props: { width: 256 } },
      };
      const body: t.IPostNsBody = { cells, columns, rows };
      await http.post(mock.url('ns:foo'), body);

      const test = async (path: string, expected?: any) => {
        const url = mock.url(path);
        const res = await http.get(url);

        // Prepare a subset of the return data to compare with expected result-set.
        const json = res.json<t.IPostNsResponse>().data;
        delete json.ns;
        stripHashes(json); // NB: Ignore calculated hash values for the purposes of this test.
        expect(json).to.eql(expected);
      };

      await test('ns:foo', {});
      await test('ns:foo?cells=false&rows=false&columns=false', {}); // Same as default (line above).

      await test('ns:foo?cells', { cells });
      await test('ns:foo?cells=true', { cells });
      await test('ns:foo?cells=A1', { cells: { A1: cells.A1 } });
      await test('ns:foo?cells=A1,B1:B10&cells=C9', { cells: { A1: cells.A1, B2: cells.B2 } });
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
      await test('ns:foo?data', body);
      await test('ns:foo?data=true', body);
      await test('ns:foo?data=false', {});

      await mock.dispose();
    });

    it('GET all data (/data)', async () => {
      const mock = await createMock();
      const cells = {
        A1: { value: 'A1' },
        B2: { value: 'B2' },
        C1: { value: 'C1' },
      };
      const columns = {
        A: { props: { height: 80 } },
        C: { props: { height: 120 } },
      };
      const rows = {
        1: { props: { width: 350 } },
        3: { props: { width: 256 } },
      };
      const body: t.IPostNsBody = { cells, columns, rows };
      await http.post(mock.url('ns:foo'), body);

      const test = async (path: string, expected?: any) => {
        const url = mock.url(path);
        const res = await http.get(url);

        // Prepare a subset of the return data to compare with expected result-set.
        const json = res.json<t.IPostNsResponse>().data;
        delete json.ns;
        stripHashes(json); // NB: Ignore calculated hash values for the purposes of this test.
        expect(json).to.eql(expected);
      };

      await test('ns:foo', {});
      await test('ns:foo/data', body);

      await mock.dispose();
    });
  });
});
