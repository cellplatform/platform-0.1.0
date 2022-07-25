import { expect } from 'chai';
import { rx } from '.';

import { Pump } from './rx.pump';

type E = {
  type: 'foo';
  payload: { count?: number; msg?: string };
};

describe.only('Pump', () => {
  describe('create', () => {
    it('create with id', () => {
      const bus = rx.bus();
      const pump = Pump.create(bus);
      expect(pump.id).to.eql(rx.bus.instance(bus));
    });

    it('pump: in/out', () => {
      const bus = rx.bus<E>();
      const pump = Pump.create<E>(bus);

      const fired: E[] = [];
      const ev: E = { type: 'foo', payload: {} };

      pump.in((e) => fired.push(e));
      pump.out(ev);

      expect(fired.length).to.eql(1);
      expect(fired[0]).to.eql(ev);
    });

    it.skip('dispose$', () => {
      //
    });

    it.skip('filter', () => {
      //
    });
  });

  describe('connect', () => {
    it('throw: if connected bus is the same as the one inside the pump', () => {
      const bus = rx.bus();
      const pump = Pump.create(bus);
      const fn = () => Pump.connect(pump).to(bus);
      expect(fn).to.throw(/to a pump containing itself/);
    });

    it('fire events two-way', () => {
      const bus1 = rx.bus<E>();
      const bus2 = rx.bus<E>();
      const pump = Pump.create<E>(bus1);

      let fired1: E[] = [];
      let fired2: E[] = [];
      const reset = () => {
        fired1 = [];
        fired2 = [];
      };

      bus1.$.subscribe((e) => fired1.push(e));
      bus2.$.subscribe((e) => fired2.push(e));
      bus1.fire({ type: 'foo', payload: {} });
      expect(fired1.length).to.eql(1);
      expect(fired2).to.eql([]); // NB: not connected.

      Pump.connect(pump).to(bus2);

      reset();
      bus1.fire({ type: 'foo', payload: { msg: 'from-1' } });

      expect(fired1.length).to.eql(1);
      expect(fired2.length).to.eql(1);
      expect(fired1[0].payload.msg).to.eql('from-1');
      expect(fired2[0].payload.msg).to.eql('from-1');

      reset();
      bus2.fire({ type: 'foo', payload: { msg: 'from-2' } });

      expect(fired1.length).to.eql(1);
      expect(fired2.length).to.eql(1);
      expect(fired1[0].payload.msg).to.eql('from-2');
      expect(fired2[0].payload.msg).to.eql('from-2');
    });
  });
});
