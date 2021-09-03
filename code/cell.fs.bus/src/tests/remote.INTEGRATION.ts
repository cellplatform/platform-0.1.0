import { TestPrep, log, HttpClient, expect } from '../test';

describe('INTEGRATION', function () {
  const timeout = 30000;

  this.timeout(timeout);

  const uri = 'cell:ckt2dyzgq000008jx3664824f:A1';
  const host = '5000';
  const url = `${host}/${uri}/fs`;

  it.only('via fs.bus', async () => {
    const mock = await TestPrep();
    const png = await mock.readFile('static.test/child/tree.png');

    const events = mock.controller.events;
    const fs = mock.controller.fs('drop-test');
    await fs.write('tree.png', png.data);

    const remote = events.remote.cell(host, uri);
    const res = await remote.push('/', { timeout });

    log.info('-------------------------------------------');
    log.info('res', res);
    log.info(url);

    await mock.dispose();
  });

  it('via http (client)', async () => {
    const mock = await TestPrep();
    const png = await mock.readFile('static.test/child/tree.png');
    const data = png.data.buffer;

    const client = HttpClient.create(host).cell(uri);
    const res = await client.fs.upload({ filename: 'tree.png', data });
    await mock.dispose();

    log.info('-------------------------------------------');
    log.info('res', res);

    expect(res.ok).to.eql(true);
  });
});
