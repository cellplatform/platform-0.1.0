import * as semver from 'semver';
import { IMicroRequest } from '@platform/micro';
import { createMock, expect, Http, HttpClient, t } from '../test';

describe('client (http)', () => {
  it('sends headers (client/schema version)', async () => {
    const mock = await createMock();
    const client = mock.client;

    const requests: IMicroRequest[] = [];
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

  it('uses custom HTTP client (merging headers)', async () => {
    const mock = await createMock();
    const http = Http.create({ headers: { foo: 'hello' } });
    const client = HttpClient.create({ http, host: mock.port });

    const headers: t.IHttpHeaders[] = [];
    mock.service.request$.subscribe(e => headers.push(e.req.headers as t.IHttpHeaders));

    const res = await client.info();
    await mock.dispose();

    expect(res.ok).to.eql(true);

    // NB: Headers from passed in client, along with default headers, are passed to server.
    expect(headers[0].foo).to.eql('hello');
    expect(headers[0].client).to.includes('CellOS;');
  });
});
