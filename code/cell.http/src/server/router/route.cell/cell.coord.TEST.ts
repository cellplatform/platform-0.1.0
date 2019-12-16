import { t, expect, http, createMock, post } from '../../../test';

describe('route: coord (URI: cell|row|col)', () => {
  describe('invalid URI', () => {
    const test = async (path: string, expected: string) => {
      const mock = await createMock();
      const url = mock.url(path);
      const res = await http.get(url);
      await mock.dispose();

      const body = res.json as any;

      expect(res.status).to.eql(400);
      expect(body.error.type).to.eql('HTTP/uri/malformed');
      expect(body.error.message).to.contain('Malformed');
      expect(body.error.message).to.contain(expected);
    };

    it('malformed: no id', async () => {
      const msg = 'does not contain a namespace-identifier';
      await test('/cell:!A1', msg);
      await test('/cell:!1', msg);
      await test('/cell:!A', msg);
    });
  });

  describe('does not exist (200, exists:false)', () => {
    const test = async (uri: string) => {
      const mock = await createMock();
      const res = await http.get(mock.url(uri));
      await mock.dispose();

      const body = res.json as t.IResGetCoord;

      expect(body.uri).to.eql(uri);
      expect(body.exists).to.eql(false);
      expect(body.createdAt).to.eql(-1);
      expect(body.modifiedAt).to.eql(-1);
      expect(body.data).to.eql({});
    };

    it('cell:foo!A1 (cell)', async () => {
      await test('cell:foo!A1');
    });

    it('cell:foo!1 (row)', async () => {
      await test('cell:foo!1');
    });

    it('cell:foo!A (column)', async () => {
      await test('cell:foo!A');
    });
  });

  describe('GET', () => {
    it('redirects from "cell:foo" to "ns:" end-point', async () => {
      const test = async (path: string) => {
        const mock = await createMock();
        const res = await http.get(mock.url(path));
        await mock.dispose();

        const json = res.json as t.IResGetNs;
        expect(res.status).to.eql(200);
        expect(json.uri).to.eql('ns:foo'); // NB: The "ns:" URI, not "cell:".
        expect(json.exists).to.eql(false);
        expect(json.data.ns.id).to.eql('foo');
      };

      await test('/cell:foo');
      await test('/cell:foo/');
      await test('/cell:foo?cells');
    });
  });

  describe('cell:', () => {
    it('cell', async () => {
      const mock = await createMock();
      await post.ns('ns:foo', { cells: { A1: { value: 123 } } }, { mock });

      const uri = 'cell:foo!A1';
      const res = await http.get(mock.url(uri));
      await mock.dispose();

      const body = res.json as t.IResGetCell;
      const data = body.data;

      expect(body.uri).to.eql(uri);
      expect(body.exists).to.eql(true);
      expect(body.createdAt).to.not.eql(-1);
      expect(body.modifiedAt).to.not.eql(-1);

      expect(data.value).to.eql(123);
      expect(data.hash).to.match(/^sha256-([a-z0-9]{60,})/);
    });

    it('column', async () => {
      const mock = await createMock();
      await post.ns('ns:foo', { columns: { A: { props: { width: 123 } } } }, { mock });

      const uri = 'cell:foo!A';
      const res = await http.get(mock.url(uri));
      await mock.dispose();

      const body = res.json as t.IResGetColumn;
      const data = body.data;

      expect(body.uri).to.eql(uri);
      expect(body.exists).to.eql(true);
      expect(body.createdAt).to.not.eql(-1);
      expect(body.modifiedAt).to.not.eql(-1);

      expect(data.props).to.eql({ width: 123 });
      expect(data.hash).to.match(/^sha256-([a-z0-9]{60,})/);
    });

    it('row', async () => {
      const mock = await createMock();
      await post.ns('ns:foo', { rows: { 1: { props: { height: 80 } } } }, { mock });

      const uri = 'cell:foo!1';
      const res = await http.get(mock.url(uri));
      await mock.dispose();

      const body = res.json as t.IResGetRow;
      const data = body.data;

      expect(body.uri).to.eql(uri);
      expect(body.exists).to.eql(true);
      expect(body.createdAt).to.not.eql(-1);
      expect(body.modifiedAt).to.not.eql(-1);

      expect(data.props).to.eql({ height: 80 });
      expect(data.hash).to.match(/^sha256-([a-z0-9]{60,})/);
    });
  });
});
