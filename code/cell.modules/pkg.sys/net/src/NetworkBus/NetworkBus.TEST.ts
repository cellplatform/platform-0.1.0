import { is } from '@platform/util.value';
import { Subject } from 'rxjs';

import { NetworkBus } from '.';
import { expect, t, time } from '../test';

type MyEvent = { type: 'foo'; payload: { count: number } };

function testBus(options: { event?: MyEvent; uris?: t.NetworkBusUri[]; local?: string } = {}) {
  const local = options.local ?? 'uri:me';
  const uris = options.uris ?? [];
  const in$ = new Subject<MyEvent>();
  const state = {
    sent: [] as { targets: string[]; event: t.Event }[],
  };

  const bus = NetworkBus<MyEvent>({
    local: async () => local,
    remotes: async () => uris,
    out: (e) => state.sent.push(e),
    in$,
  });

  const res = { bus, state, local, uris, in$ };
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
      expect(state.sent.length).to.eql(1);
      expect(state.sent[0].targets).to.eql(uris);
      expect(state.sent[0].event).to.eql(event);
    });
  });
});
