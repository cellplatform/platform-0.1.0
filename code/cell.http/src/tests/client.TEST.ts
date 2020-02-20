import { t, expect, createMock, constants } from '../test';
import * as semver from 'semver';

describe('client (http)', () => {
  it('sends headers (client/schema version)', async () => {
    const mock = await createMock();
    const client = mock.client;

    const requests: t.IMicroRequest[] = [];
    mock.service.request$.subscribe(e => requests.push(e));
    await client.cell('cell:foo!A1').info();
    await mock.dispose();

    expect(requests.length).to.eql(1);
    const headers = requests[0].req.headers || {};

    const isValidVersion = (version: string) => semver.valid(version) !== null;

    const header = (headers.client || '') as string;

    expect(header).to.include('CellOS');
    expect(header).to.include('client@');
    expect(header).to.include('schema@');

    const parts = header.split(';');
    parts
      .filter(item => item.includes('@'))
      .forEach(item => {
        const version = item.split('@')[1];
        expect(isValidVersion(version)).to.eql(true);
      });
  });

  describe('sys (root)', () => {
    it('info', async () => {
      const mock = await createMock();
      const client = mock.client;

      type T = t.IResGetSysInfo & { foo: number };
      const res = await client.info<T>();
      await mock.dispose();

      expect(res.status).to.eql(200);
      expect(res.body.foo).to.eql(undefined); // NB: On custom type as test (but not actually returned by server).
      expect(res.body.host).to.eql(`${mock.host}:${mock.port}`);
    });
  });

  describe('ns', () => {
    it('read', async () => {
      const mock = await createMock();
      const client = mock.client.ns('foo');

      const res = await client.read();
      expect(res.body.uri).to.eql('ns:foo');
      expect(res.body.exists).to.eql(false);

      await mock.dispose();
    });

    it('write', async () => {
      const mock = await createMock();
      const client = mock.client.ns('foo');

      const cells: t.ICellMap<t.ICellData> = {
        A1: { value: 123 },
      };
      const res = await client.write({ cells }, { cells: true });
      const A1 = res.body.data.cells?.A1;
      const ns = res.body.data.ns;
      await mock.dispose();

      expect(res.body.uri).to.eql('ns:foo');
      expect(res.body.exists).to.eql(true);

      expect(res.body.changes?.length).to.greaterThan(1);

      expect(ns.hash).to.match(/^sha256-/);
      expect(ns.id).to.eql('foo');

      const versions = constants.getVersions();
      const schemaVersion = versions.toVersion(versions.schema);
      expect(ns.props?.schema).to.eql(schemaVersion);

      expect(A1?.value).to.eql(123);
      expect(A1?.hash).to.match(/^sha256-/);
    });
  });
});
