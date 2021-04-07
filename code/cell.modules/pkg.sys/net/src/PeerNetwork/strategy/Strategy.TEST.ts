import { expect, t, cuid, rx } from '../../test';
import { Strategy } from '.';

describe.only('Strategy (Peer Network)', () => {
  const self = cuid();
  const bus = rx.bus<t.PeerEvent>();
  const $ = bus.event$;

  it('dispose', () => {
    const strategy = Strategy({ self, bus });

    const fire = { root: 0, connection: 0 };
    strategy.dispose$.subscribe(() => fire.root++);
    strategy.connection.dispose$.subscribe(() => fire.connection++);

    strategy.dispose();
    strategy.dispose();
    strategy.dispose();

    expect(fire.root).to.eql(1);
    expect(fire.connection).to.eql(1); // NB: Disposes deeply.
  });

  describe('Connection', () => {
    it('purgeOnClose - default:true', () => {
      const connection = Strategy({ self, bus }).connection;
      expect(connection.autoPurgeOnClose).to.eql(true);
    });

    it('meshPropagation - default:true', () => {
      const connection = Strategy({ self, bus }).connection;
      expect(connection.autoPropagation).to.eql(true);
    });
  });
});
