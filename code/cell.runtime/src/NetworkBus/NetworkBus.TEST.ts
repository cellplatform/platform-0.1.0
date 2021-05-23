import { is } from '@platform/util.value';
import { Subject } from 'rxjs';

import { NetworkBus } from '.';
import { expect, t, time } from '../test';

type MyEvent = { type: 'foo'; payload: { count?: number } };

function testBus(options: { uris?: t.NetworkBusUri[]; local?: string } = {}) {
  const local = options.local ?? 'uri:me';
  const uris = options.uris ?? [];
  const in$ = new Subject<MyEvent>();

  const state = {
    out: [] as { targets: string[]; event: t.Event }[],
  };

  const pump: t.NetworkPump<MyEvent> = {
    in: (fn) => in$.subscribe(fn),
    out: (e) => state.out.push(e),
  };

  const bus = NetworkBus<MyEvent>({
    pump,
    local: async () => local,
    remotes: async () => uris,
  });

  const res = { bus, state, local, uris, in$ };
  return res;
}

describe('NetworkBus', () => {
  it('$ (observable)', () => {
    const bus = testBus().bus;
    expect(is.observable(bus.$)).to.eql(true);
  });

  describe('IO: pump/in', () => {
    it('fires incoming message from the network pump through the LOCAL observable ($)', () => {
      const { bus, in$ } = testBus({});

      const fired: MyEvent[] = [];
      bus.$.subscribe((e) => fired.push(e));

      const event: MyEvent = { type: 'foo', payload: {} };
      in$.next(event);

      expect(fired.length).to.eql(1);
      expect(fired[0]).to.eql(event);
    });
  });

  describe('IO: pump/out', () => {
    const uris = ['uri:one', 'uri:two', 'uri:three'];

    describe('bus.fire (root)', () => {
      it('sends through LOCAL observable ($)', async () => {
        const { bus } = testBus();

        const fired: MyEvent[] = [];
        bus.$.subscribe((e) => fired.push(e));

        const event: MyEvent = { type: 'foo', payload: { count: 999 } };
        bus.fire(event);
        expect(fired.length).to.eql(0); // NB: Network events are always sent asynchronously.

        await time.wait(0);
        expect(fired.length).to.eql(1);
        expect(fired[0]).to.eql(event);
      });

      it('sends to REMOTE targets (URIs)', async () => {
        const { bus, state } = testBus({ uris });

        const event: MyEvent = { type: 'foo', payload: { count: 888 } };
        bus.fire(event);
        expect(state.out.length).to.eql(0); // NB: Network events are always sent asynchronously.

        await time.wait(0);
        expect(state.out.length).to.eql(1);
        expect(state.out[0].targets).to.eql(uris);
        expect(state.out[0].event).to.eql(event);
      });
    });

    describe('target', () => {
      const event: MyEvent = { type: 'foo', payload: { count: 123 } };

      it('bus.target.local: sends to LOCAL observable only ', async () => {
        const { bus, state } = testBus({ uris });

        const fired: MyEvent[] = [];
        bus.$.subscribe((e) => fired.push(e));

        const wait = bus.target.local(event);
        expect(fired.length).to.eql(0); // NB: Network events are always sent asynchronously.

        const res = await wait;
        expect(fired).to.eql([event]); // Fired locally.
        expect(res.targetted).to.eql(['uri:me']);
        expect(state.out.length).to.eql(0);
      });

      it('bus.target.remote: sends to REMOTE targets only', async () => {
        const { bus, state } = testBus({ uris });

        const fired: MyEvent[] = [];
        bus.$.subscribe((e) => fired.push(e));

        const res = await bus.target.remote(event);

        expect(fired.length).to.eql(0); // NB: Only sent to remote targets.

        expect(res.targetted).to.not.include('uri:me');
        expect(res.targetted).to.eql(uris);

        expect(state.out.length).to.eql(1);
        expect(state.out[0].event).to.eql(event);
        expect(state.out[0].targets).to.eql(uris);
      });

      describe('bus.target.node', () => {
        it('local target URI only ("uri:me")', async () => {
          const { bus, state } = testBus({ uris });

          const fired: MyEvent[] = [];
          bus.$.subscribe((e) => fired.push(e));

          const target = 'uri:me';
          const res = await bus.target.node(target).fire(event);

          expect(fired).to.eql([event]); // Fired locally.

          expect(res.targetted).to.eql([target]);
          expect(res.event).to.eql(event);
          expect(state.out.length).to.eql(0);
        });

        it('single target remote URI', async () => {
          const { bus, state } = testBus({ uris });

          const fired: MyEvent[] = [];
          bus.$.subscribe((e) => fired.push(e));

          const target = 'uri:one';
          const res = await bus.target.node(target).fire(event);

          expect(fired).to.eql([]); // NB: Only remote targets specified.

          expect(res.targetted).to.eql([target]);
          expect(res.event).to.eql(event);

          expect(state.out.length).to.eql(1);
          expect(state.out[0].targets).to.eql([target]);
        });

        it('multiple target URIs (local and remote)', async () => {
          const { bus, state } = testBus({ uris });

          const fired: MyEvent[] = [];
          bus.$.subscribe((e) => fired.push(e));

          const res = await bus.target.node('uri:one', 'uri:three', 'uri:me').fire(event);

          expect(fired).to.eql([event]); // Fired locally.

          expect(res.targetted).to.eql(['uri:me', 'uri:one', 'uri:three']);
          expect(res.event).to.eql(event);

          expect(state.out.length).to.eql(1);
          expect(state.out[0].targets).to.eql(['uri:one', 'uri:three']);
        });

        it('given target URI does not exist in "remotes" (nothing broadcast)', async () => {
          const { bus, state } = testBus({ uris });
          const res = await bus.target.node('foobar:404').fire(event);
          expect(res.targetted).to.eql([]);
          expect(state.out).to.eql([]);
        });

        it('no targets: broadcasts nothing', async () => {
          const { bus, state } = testBus({ uris });
          const res = await bus.target.node().fire(event);
          expect(res.targetted).to.eql([]);
          expect(state.out).to.eql([]);
        });
      });

      describe('bus.target.filter', () => {
        it('filters on specific target URI(s)', async () => {
          const { bus, state } = testBus({ uris });

          const fired: MyEvent[] = [];
          bus.$.subscribe((e) => fired.push(e));

          const res = await bus.target
            .filter((e) => e.uri === 'uri:me' || e.uri === 'uri:two')
            .fire(event);

          expect(fired).to.eql([event]); // Fired locally.

          expect(res.targetted).to.eql(['uri:me', 'uri:two']);
          expect(res.event).to.eql(event);

          expect(state.out.length).to.eql(1);
          expect(state.out[0].targets).to.eql(['uri:two']);
        });

        it('no filter: broadcasts everywhere (NB: edge-case, not an intended usage scenario)', async () => {
          const { bus, state } = testBus({ uris });

          const fired: MyEvent[] = [];
          bus.$.subscribe((e) => fired.push(e));

          const res = await bus.target.filter().fire(event);

          expect(fired).to.eql([event]); // Fired locally.
          expect(res.targetted).to.eql(['uri:me', ...uris]);

          expect(state.out.length).to.eql(1);
          expect(state.out[0].targets).to.eql(uris);
        });
      });
    });
  });
});
