import { TestPrep, log } from '../test';

describe('INTEGRATION', function () {
  this.timeout(10000);

  it('tmp', async () => {
    // const one = await TestPrep({ id: 'one', dir: 'foo' });

    const mock = await TestPrep();
    const png = await mock.readFile('static.test/child/tree.png');

    const events = mock.controller.events;
    const fs = mock.controller.fs('drop-test');
    await fs.write('tree.png', png.data);

    const remote = events.remote.cell('dev.db.team', 'cell:ckt2dyzgq000008jx3664824f:A1');
    const res = await remote.push();

    log.info('-------------------------------------------');
    log.info('res', res);

    await mock.dispose();
  });
});
