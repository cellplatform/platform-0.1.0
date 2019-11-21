import { t, expect, http, createMock } from '../../test';

describe('route: namespace', () => {
  it('invalid "ns" URI (no id)', async () => {
    const mock = await createMock();
    const url = mock.url('/ns:');
    const res = await http.get(url);
    await mock.dispose();

    expect(res.status).to.eql(400);

    const body = res.json();
    expect(body.error.type).to.eql('HTTP/malformed');
    expect(body.error.message).to.contain('Malformed namespace URI, does not contain an ID');
  });

  it('does not yet exist', async () => {
    const mock = await createMock();
    const url = mock.url('ns:foo');
    const res = await http.get(url);
    await mock.dispose();

    expect(res.status).to.eql(200);

    const body = res.json<t.IGetNsResponse>();
    expect(body.uri).to.eql('ns:foo');
    expect(body.exists).to.eql(false);
    expect(body.createdAt).to.eql(-1);
    expect(body.modifiedAt).to.eql(-1);
    expect(body.data).to.eql({ ns: {} }); // NB: No data by default (requires query-string).

    // TODO - hash
  });

  describe('data', () => {
    it('POST change data', async () => {
      const mock = await createMock();
      const url = mock.url('ns:foo?cells');

      const cells = { A1: { value: 'hello' } };
      const payload: t.IPostNsBody = {
        data: { cells },
      };

      const res = await http.post(url, payload);
      await mock.dispose();

      const json = res.json<t.IPostNsResponse>();
      expect(json.uri).to.eql('ns:foo');
      expect(json.exists).to.eql(true);
      expect(json.createdAt).to.not.eql(-1);
      expect(json.modifiedAt).to.not.eql(-1);
      expect(json.data.ns).to.eql({ id: 'foo' });
      expect(json.data.cells).to.eql(cells);
      expect(json.data.rows).to.eql(undefined);
      expect(json.data.columns).to.eql(undefined);
    });

    it('GET squashes null values ()', async () => {
      const mock = await createMock();

      const data: any = {
        cells: { A1: { value: 'hello', props: null } },
        rows: { 1: { props: null } },
        columns: { A: { props: null } },
      };
      const payload: t.IPostNsBody = { data };
      await http.post(mock.url('ns:foo'), payload);

      const url = mock.url('ns:foo/data');
      const res = await http.get(url);
      await mock.dispose();

      const json = res.json();
      expect(json.data.cells).to.eql({ A1: { value: 'hello' } });
      expect(json.data.rows).to.eql({});
      expect(json.data.columns).to.eql({});
    });

    it('GET (selective data via query-string flags)', async () => {
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
      const data = { cells, columns, rows };
      const payload: t.IPostNsBody = { data };
      await http.post(mock.url('ns:foo'), payload);

      const test = async (path: string, expected?: any) => {
        const url = mock.url(path);
        const res = await http.get(url);

        // Prepare a subset of the return data to compare with expected result-set.
        const json = res.json<t.IPostNsResponse>().data;
        delete json.ns;
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

      await test('ns:foo?cells&rows&columns', data);

      await mock.dispose();
    });

    it('GET /data (all data)', async () => {
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
      const data = { cells, columns, rows };
      const payload: t.IPostNsBody = { data };
      await http.post(mock.url('ns:foo'), payload);

      const test = async (path: string, expected?: any) => {
        const url = mock.url(path);
        const res = await http.get(url);

        // Prepare a subset of the return data to compare with expected result-set.
        const json = res.json<t.IPostNsResponse>().data;
        delete json.ns;
        expect(json).to.eql(expected);
      };

      await test('ns:foo', {});
      await test('ns:foo/data', data);

      await mock.dispose();
    });
  });
});
