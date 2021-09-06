import { nodefs, t, expect, rx } from '../test';
import { VercelBus } from '.';
import { DEFAULT, Filesystem } from './common';

describe.only('BusController', function () {
  this.timeout(5000);

  const token = process.env.VERCEL_TEST_TOKEN ?? '';
  const bus = rx.bus<t.VercelEvent>();
  const store = Filesystem.Controller({ bus, fs: nodefs.resolve('static.test') });
  const fs = store.fs();

  describe('Info', () => {
    it('defaults', async () => {
      const controller = VercelBus.Controller({ token, fs, bus });
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
      const controller = VercelBus.Controller({ token, id, fs, bus });

      expect(controller.id).to.eql(id);
      expect(controller.events.id).to.eql(id);
    });

    it('filter', async () => {
      let allow = true;
      const controller = VercelBus.Controller({ token, fs, bus, filter: (e) => allow });
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
