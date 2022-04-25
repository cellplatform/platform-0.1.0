import { WebRuntimeBus } from '.';
import { expect, rx, Test } from '../web.test';

export default Test.describe('WebRuntimeBus (Controller)', (e) => {
  e.describe('events', (e) => {
    e.it('info', async () => {
      const instance = { bus: rx.bus() };
      const runtime = WebRuntimeBus.Controller({ instance });

      const res = await runtime.events.info.get();
      runtime.dispose();

      expect(res.exists).to.eql(true);
      expect(res.info?.module.name).to.eql('sys.runtime.web');
    });

    e.it('netbus (exists: false)', async () => {
      const instance = { bus: rx.bus() };
      const runtime = WebRuntimeBus.Controller({ instance });

      const res = await runtime.events.netbus.get({ timeout: 10 });
      runtime.dispose();

      expect(res.exists).to.eql(false);
      expect(res.netbus).to.eql(undefined);
      expect(res.error).to.eql(undefined);
    });
  });
});
