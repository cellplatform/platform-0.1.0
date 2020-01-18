import { t, expect, createMock } from '../test';
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

    const header = (headers['cell-os'] || '') as string;
    expect(header).to.include('client@');
    expect(header).to.include('schema@');

    const parts = header.split(',');
    parts.forEach(item => {
      const version = item.split('@')[1];
      expect(isValidVersion(version)).to.eql(true);
    });
  });
});
