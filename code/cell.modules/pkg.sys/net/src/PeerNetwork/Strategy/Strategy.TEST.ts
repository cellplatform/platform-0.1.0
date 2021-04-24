import { expect, t, cuid, rx } from '../../test';
import { Strategy } from '.';

describe.only('Strategy (Peer Network)', () => {
  const self = cuid();
  const bus = rx.bus<t.PeerEvent>();
  const $ = bus.event$;

  it('dispose', () => {
    const strategy = Strategy({ self, bus });

    const fire = { root: 0, connection: 0, group: 0 };
    strategy.dispose$.subscribe(() => fire.root++);
    strategy.connection.dispose$.subscribe(() => fire.connection++);
    strategy.group.dispose$.subscribe(() => fire.group++);

    strategy.dispose();
    strategy.dispose();
    strategy.dispose();

    expect(fire.root).to.eql(1);

    // NB: Disposes deeply.
    expect(fire.connection).to.eql(1);
    expect(fire.group).to.eql(1);
  });

  describe('Connection', () => {
    it('default:true - purgeOnClose', () => {
      const connection = Strategy({ self, bus }).connection;
      expect(connection.autoPurgeOnClose).to.eql(true);
    });

    it('default:true - meshPropagation', () => {
      const connection = Strategy({ self, bus }).connection;
      expect(connection.autoPropagation).to.eql(true);
    });

    it('default:true - ensureConnectionClosed', () => {
      const connection = Strategy({ self, bus }).connection;
      expect(connection.ensureClosed).to.eql(true);
    });
  });

  describe('Group', () => {
    it('default:true - connections', () => {
      const group = Strategy({ self, bus }).group;
      expect(group.connections).to.eql(true);
    });
  });
});
