import { t, expect, time } from '../test';
import { NetworkBus } from '.';

import { is } from '@platform/util.value';

type MyEvent = { type: 'foo'; payload: { count: number } };

function testBus(options: { event?: MyEvent; uris?: t.NetworkBusUri[]; local?: string } = {}) {
  const uris = options.uris ?? [];
  const local = options.local ?? 'uri:me';

  const state = {
    sent: [] as { uri: string; event: t.Event }[],
  };

  const bus = NetworkBus<MyEvent>({
    local: async () => local,
    remotes: async () => uris,
    send: (e) => state.sent.push(e),
  });

  const res = { bus, state, local, uris };
  return res;
}

describe.only('NetworkBus', () => {
  it('observable', () => {
    const bus = testBus().bus;
    expect(is.observable(bus.$)).to.eql(true);
  });

  describe('bus.fire (root)', () => {
    const event: MyEvent = { type: 'foo', payload: { count: 999 } };

    it('sends through LOCAL observable', async () => {
      const { bus } = testBus({ event });

      const fired: MyEvent[] = [];
      bus.$.subscribe((e) => fired.push(e));

      bus.fire(event);
      expect(fired.length).to.eql(0); // NB: Network events are always sent asynchronously.

      await time.wait(0);
      expect(fired.length).to.eql(1);
      expect(fired[0]).to.eql(event);
    });

    it('sends to REMOTE targets', async () => {
      const uris = ['uri:foo', 'uri:bar'];
      const { bus, state } = testBus({ event, uris });

      bus.fire(event);
      expect(state.sent.length).to.eql(0); // NB: Network events are always sent asynchronously.

      await time.wait(0);
      expect(state.sent.length).to.eql(2);

      expect(state.sent[0].uri).to.eql(uris[0]);
      expect(state.sent[1].uri).to.eql(uris[1]);

      expect(state.sent[0].event).to.eql(event);
      expect(state.sent[1].event).to.eql(event);
    });
  });
});
