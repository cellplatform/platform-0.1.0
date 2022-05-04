import { nodefs, t, expect, rx } from '../test';
import { BusController, BusEvents } from '.';
import { DEFAULT, Filesystem } from './common';

describe.only('BusController', function () {
  this.timeout(5000);

  const token = process.env.VERCEL_TEST_TOKEN ?? '';
  const bus = rx.bus<t.VercelEvent>();
  const instance = { bus };
  const store = Filesystem.Controller({ bus, driver: nodefs.resolve('static.test') });
  const fs = store.fs();

  describe('Info', () => {
    it('defaults', async () => {
      const controller = BusController({ instance, token, fs });
      const events = BusEvents({ instance });

      const res = await events.info.get();
      controller.dispose();

      expect(controller.instance.id).to.eql(DEFAULT.id);
      expect(controller.instance.bus).to.eql(rx.bus.instance(bus));
      expect(controller.events.id).to.eql(DEFAULT.id);
      expect(events.id).to.eql(DEFAULT.id);
      expect(res.info?.endpoint).to.eql(undefined); // NB: The 'endpoint:true' option was not specified.
    });

    it('explicit id', async () => {
      const id = 'my-instance';
      const controller = BusController({ instance: { bus, id }, token, fs });

      expect(controller.instance.id).to.eql(id);
      expect(controller.instance.bus).to.eql(rx.bus.instance(bus));
      expect(controller.events.id).to.eql(id);
    });

    it('filter', async () => {
      let allow = true;
      const controller = BusController({ instance, token, fs, filter: (e) => allow });
      const events = BusEvents({ instance });

      const res1 = await events.info.get();
      allow = false;

      const res2 = await events.info.get({ timeout: 10 });
      controller.dispose();

      expect(res1.error).to.eql(undefined);
      expect(res2.error).to.include('timed out');
    });
  });
});
