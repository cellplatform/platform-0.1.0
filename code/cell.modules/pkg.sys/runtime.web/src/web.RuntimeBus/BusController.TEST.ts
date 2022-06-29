import { WebRuntimeBus } from '.';
import { expect, rx, Test, slug } from '../web.test';
import { DEFAULT } from './common';

export default Test.describe('WebRuntimeBus', (e) => {
  e.describe('controller/events', (e) => {
    e.it('instance', async () => {
      const bus = rx.bus();
      const id = `foo.${slug()}`;

      const env1 = WebRuntimeBus.Controller({ instance: { bus } });
      const env2 = WebRuntimeBus.Controller({ instance: { bus, id } });

      expect(env1.instance.bus).to.eql(rx.bus.instance(bus));
      expect(env2.instance.bus).to.eql(rx.bus.instance(bus));

      expect(env1.instance.id).to.eql(DEFAULT.instance);
      expect(env2.instance.id).to.eql(id);
    });

    e.it('info', async () => {
      const instance = { bus: rx.bus() };
      const controller = WebRuntimeBus.Controller({ instance });
      const events = WebRuntimeBus.Events({ instance });

      const res = await events.info.get();
      controller.dispose();
      events.dispose();

      expect(res.exists).to.eql(true);
      expect(res.info?.module.name).to.eql('sys.runtime.web');
    });

    e.it('netbus (exists: false)', async () => {
      const instance = { bus: rx.bus() };
      const runtime = WebRuntimeBus.Controller({ instance });

      const res = await runtime.netbus.get({ timeout: 10 });
      runtime.dispose();

      expect(res.exists).to.eql(false);
      expect(res.netbus).to.eql(undefined);
      expect(res.error).to.eql(undefined);
    });
  });
});
