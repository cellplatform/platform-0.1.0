import { nodefs, t, expect, rx } from '../test';
import { VercelBus } from '.';
import { DEFAULT, FsBus } from './common';

describe.only('BusController', () => {
  const bus = rx.bus<t.VercelEvent>();
  const store = FsBus.Controller({ bus, fs: nodefs.resolve('dist') });
  const fs = store.fs();

  describe('Info', function () {
    this.timeout(5000);

    it('defaults', async () => {
      const controller = VercelBus.Controller({ fs, bus });
      const events = VercelBus.Events({ bus });

      const res = await events.info.get();
      controller.dispose();

      expect(controller.id).to.eql(DEFAULT.id);
      expect(controller.events.id).to.eql(DEFAULT.id);
      expect(events.id).to.eql(DEFAULT.id);
      expect(res.info?.endpoint.version).to.eql(DEFAULT.version);
    });

    it('explicit id', async () => {
      const id = 'my-instance';
      const controller = VercelBus.Controller({ id, fs, bus });

      expect(controller.id).to.eql(id);
      expect(controller.events.id).to.eql(id);
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
