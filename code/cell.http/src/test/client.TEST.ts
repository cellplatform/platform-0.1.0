import { t, expect, createMock } from '.';
import * as semver from 'semver';

describe('client', () => {
  it('sends client/schema version in header', async () => {
    const mock = await createMock();
    const client = mock.client;

    const requests: t.IMicroRequest[] = [];
    mock.service.request$.subscribe(e => requests.push(e));
    await client.cell('cell:foo!A1').info();
    await mock.dispose();

    expect(requests.length).to.eql(1);
    const headers = requests[0].req.headers || {};
    console.log('headers', headers);

    const testValid = (key: string) => {
      const header = headers[key] as string;
      expect(semver.valid(header)).to.not.eql(null);
    };

    testValid('cell-os-schema');
    testValid('cell-os-client');
  });
});
