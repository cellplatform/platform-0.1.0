import { expect, Test } from 'sys.ui.dev';

import { PeerNetwork } from '.';
import { cuid, rx } from './common';

const signal = 'rtc.cellfs.com';

export default Test.describe('PeerNetwork', (e) => {
  e.describe('start', (e) => {
    e.it('generate "self" peer-id', async () => {
      const bus = rx.bus();
      const network = await PeerNetwork.start({ bus, signal });
      expect(network.self.startsWith('c')).to.eql(true);
      network.dispose();
    });

    e.it('use given "self" peer-id', async () => {
      const bus = rx.bus();
      const self = cuid();
      const network = await PeerNetwork.start({ bus, self, signal });
      expect(network.self).to.eql(self);
      network.dispose();
    });

    e.it('status events', async () => {
      const bus = rx.bus();
      const network = await PeerNetwork.start({ bus, signal });

      const status = await network.events.peer.status(network.self).get();
      const { netbus } = await network.events.runtime.netbus.get();

      expect(status.exists).to.eql(true);
      expect(netbus).to.equal(netbus);

      network.dispose();
    });
  });
});
