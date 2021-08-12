import { fs, t, expect, rx } from '../test';
import { VercelBus } from '.';
import { DEFAULT } from './common';

describe.only('BusController', () => {
  const bus = rx.bus<t.VercelEvent>();

  describe('ModuleInfo', function () {
    this.timeout(30000);

    it('defaults', async () => {
      const controller = VercelBus.Controller({ fs, bus });
      const events = VercelBus.Events({ bus });

      const res = await events.info.get();
      controller.dispose();

      expect(res.info?.endpoint.version).to.eql(DEFAULT.version);
    });

    it('filter', async () => {
      let allow = true;
      const controller = VercelBus.Controller({ fs, bus, filter: (e) => allow });
      const events = VercelBus.Events({ bus });

      const res1 = await events.info.get();
      allow = false;
      const res2 = await events.info.get({ timeout: 10 });
      controller.dispose();

      expect(res1.error).to.eql(undefined);
      expect(res2.error).to.include('timed out');
    });
  });
});
