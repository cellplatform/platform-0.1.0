import { expect, t, cuid, rx } from '../../../test';
import { PeerStrategy } from '.';
import { NetBus } from '../common';

describe('PeerStrategy', () => {
  const self = cuid();
  const bus = rx.bus<t.PeerEvent>();
  const netbus = NetBus({ self, bus });
  const $ = bus.$;

  it('dispose', () => {
    const strategy = PeerStrategy({ bus, netbus });

    const fire = { root: 0, connection: 0 };
    strategy.dispose$.subscribe(() => fire.root++);
    strategy.connection.dispose$.subscribe(() => fire.connection++);

    strategy.dispose();
    strategy.dispose();
    strategy.dispose();

    expect(fire.root).to.eql(1);

    // NB: Disposes deeply.
    expect(fire.connection).to.eql(1);
  });

  describe('Connection', () => {
    it('default:true - purgeOnClose', () => {
      const connection = PeerStrategy({ bus, netbus }).connection;
      expect(connection.autoPurgeOnClose).to.eql(true);
    });

    it('default:true - meshPropagation', () => {
      const connection = PeerStrategy({ bus, netbus }).connection;
      expect(connection.autoPropagation).to.eql(true);
    });

    it('default:true - ensureConnectionClosed', () => {
      const connection = PeerStrategy({ bus, netbus }).connection;
      expect(connection.ensureClosed).to.eql(true);
    });
  });
});
