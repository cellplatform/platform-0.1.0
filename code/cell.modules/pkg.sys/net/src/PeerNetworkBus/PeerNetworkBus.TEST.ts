import { expect } from 'chai';
import { WebRuntime } from 'sys.runtime.web';
import { Test } from 'sys.ui.dev';

import { PeerNetworkBus } from '.';
import { cuid, rx, t, time } from '../common';

export default Test.describe('PeerNetworkBus', (e) => {
  e.it('init (default)', () => {
    const self = cuid();
    const bus = rx.bus();
    const netbus = PeerNetworkBus({ bus, self });

    expect(netbus.self).to.eql(self);
    expect(netbus.connections).to.eql([]);
  });

  e.it('fire locally', async () => {
    const bus = rx.bus();
    const netbus = PeerNetworkBus({ bus, self: cuid() });

    const fired: t.Event[] = [];
    netbus.$.subscribe((e) => fired.push(e));

    const event: t.Event = { type: 'foo', payload: { count: 0 } };
    netbus.fire(event);

    await time.wait(0);
    expect(fired).to.eql([event]);
  });

  e.describe('WebRuntime', (e) => {
    e.it('retrieve [netbus] via event', async () => {
      const bus = rx.bus();
      const netbus = PeerNetworkBus({ bus, self: cuid() });
      const runtime = WebRuntime.Bus.Controller({ bus, netbus });

      const res = await runtime.events.netbus.get({});
      runtime.dispose();

      expect(res.exists).to.eql(true);
      expect(res.netbus).to.equal(netbus);
    });
  });
});