import { t, expect, rx } from '../test';
import { FsBus } from '.';

describe.only('BusController', () => {
  const bus = rx.bus<t.SysFsEvent>();

  describe('Info', function () {
    this.timeout(30000);

    it.skip('defaults', async () => {
      const controller = FsBus.Controller({ bus });
      const events = FsBus.Events({ bus });

      const res = await events.info.get();
      controller.dispose();

      // expect(res.info?.endpoint.version).to.eql(DEFAULT.version);
    });

    it('filter', async () => {
      let allow = true;
      const controller = FsBus.Controller({ bus, filter: (e) => allow });
      const events = FsBus.Events({ bus });

      const res1 = await events.info.get();
      allow = false;
      const res2 = await events.info.get({ timeout: 10 });
      controller.dispose();

      expect(res1.error).to.eql(undefined);
      expect(res2.error).to.include('timed out');
    });
  });
});
