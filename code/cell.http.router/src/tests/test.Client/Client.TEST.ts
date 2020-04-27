import { IMicroRequest } from '@platform/micro';
import { Client, createMock, expect, Http, HttpClient, t } from '../../test';

describe.only('Client', () => {
  it('http: from host', async () => {
    const mock = await createMock();

    const host = mock.origin;
    const client = Client.http(host);
    mock.dispose();

    expect(client.origin).to.eql(host);
  });
});
