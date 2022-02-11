import { expect, Test, cuid, rx, TEST } from '../test';
import { PeerNetwork } from '.';

const signal = TEST.SIGNAL;

export default Test.describe('PeerNetwork', (e) => {
  e.describe('start', (e) => {
    e.it('generate "self" peer-id', async () => {
      const bus = rx.bus();
      const net = await PeerNetwork.start({ bus, signal });
      const self = net.netbus.self;
      expect(self.startsWith('c')).to.eql(true);
      expect(self.length).to.greaterThan(10);
      net.dispose();
    });

    e.it('use given "self" peer-id', async () => {
      const bus = rx.bus();
      const self = cuid();
      const net = await PeerNetwork.start({ bus, self, signal });

      expect(net.netbus.self).to.eql(self);
      net.dispose();
    });

    e.it('status events', async () => {
      const bus = rx.bus();
      const net = await PeerNetwork.start({ bus, signal });
      const self = net.netbus.self;

      const status = await net.events.peer.status(self).get();
      const { netbus } = await net.events.runtime.netbus.get();

      expect(status.exists).to.eql(true);
      expect(netbus).to.equal(netbus);

      net.dispose();
    });
  });
});
