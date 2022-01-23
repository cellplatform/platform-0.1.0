import * as t from '@platform/types';
import { expect } from 'chai';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx } from '.';

describe('rx.bus', () => {
  describe('isBus', () => {
    it('is bus', () => {
      const test = (input: any) => {
        expect(rx.isBus(input)).to.eql(true);
      };
      test({ $: new Observable(), fire: () => null });
      test(rx.bus());
    });

    it('is not a bus', () => {
      const test = (input: any) => {
        expect(rx.isBus(input)).to.eql(false);
      };
      test(undefined);
      test(null);
      test(123);
      test({});
      test([123, {}]);
      test({ event$: new Observable() });
      test({ $: new Observable() });
      test({ fire: () => null });
    });
  });

  describe('busAsType', () => {
    type MyEvent = IFooEvent | IBarEvent;
    type IFooEvent = { type: 'Event/foo'; payload: { count?: number } };
    type IBarEvent = { type: 'Event/bar'; payload: { count?: number } };

    it('changes event type', () => {
      const bus1 = rx.bus();

      const fired: t.Event[] = [];
      bus1.$.subscribe((e) => fired.push(e));

      const bus2 = rx.busAsType<MyEvent>(bus1);
      bus2.fire({ type: 'Event/bar', payload: {} });

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('Event/bar');
    });
  });

  describe('bus (factory)', () => {
    type MyEvent = IFooEvent | IBarEvent;
    type IFooEvent = { type: 'Event/foo'; payload: { count?: number } };
    type IBarEvent = { type: 'Event/bar'; payload: { count?: number } };

    it('_instance (hidden "id")', () => {
      const bus = rx.bus();
      const _instance = (bus as any)._instance as string;
      expect(typeof _instance).to.eql('string');
      expect(_instance.startsWith('bus.')).to.eql(true);
      expect(_instance.length).to.greaterThan('bus.'.length);
    });

    it('create: new observable (no param, no type)', () => {
      const bus = rx.bus();

      const fired: t.Event[] = [];
      bus.$.subscribe((e) => fired.push(e));

      bus.fire({ type: 'ANY', payload: {} });

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('ANY');
    });

    it('create: use given subject', () => {
      const source$ = new Subject<any>(); // NB: Does not care the typing of the input observable (flexible).
      const bus = rx.bus<MyEvent>(source$);

      const fired: MyEvent[] = [];
      bus.$.subscribe((e) => fired.push(e));

      source$.next({ type: 'ANY', payload: {} });

      bus.fire({ type: 'Event/foo', payload: {} });

      expect(fired.length).to.eql(2);
      expect(fired[0].type).to.eql('ANY');
      expect(fired[1].type).to.eql('Event/foo');
    });

    it('create: use given bus', () => {
      const bus1 = rx.bus();
      const bus2 = rx.bus(bus1);
      expect(bus2).to.equal(bus1);
    });

    it('filters out non-standard [event] objects from the stream', () => {
      const source$ = new Subject<any>();
      const bus = rx.bus<MyEvent>(source$);

      const fired: MyEvent[] = [];
      bus.$.subscribe((e) => fired.push(e));

      // NB: All data-types that do not conform to the shape of a [Event].
      source$.next(undefined);
      source$.next(null);
      source$.next(1);
      source$.next(true);
      source$.next('two');
      source$.next({});
      source$.next({ type: 123, payload: {} });
      source$.next({ type: 'FOO' });
      source$.next({ type: 'FOO', payload: 123 });

      expect(fired.length).to.eql(0);
    });

    it('bus.isBus', () => {
      expect(rx.bus.isBus).to.equal(rx.isBus);
    });

    it('bus.asType', () => {
      expect(rx.bus.asType).to.equal(rx.busAsType);
    });

    describe('bus.clone', () => {
      type E = { type: 'foo'; payload: { count: number } };
      type Fired = { source: E[]; target: E[] };

      it('different instance', () => {
        const source = rx.bus();
        const target = rx.bus.clone(source);
        expect(rx.isBus(target)).to.eql(true);
        expect(source).to.not.equal(target);
      });

      it('modified "_instance" hidden identifier', () => {
        const source1 = rx.bus();
        const target1 = rx.bus.clone(source1);
        const target2 = rx.bus.clone(target1);

        const id1 = (source1 as any)._instance;
        const id2 = (target1 as any)._instance;
        const id3 = (target2 as any)._instance;

        expect(id1.startsWith('bus.')).to.eql(true);
        expect(id2.startsWith(`${id1}/bus.`)).to.eql(true);
        expect(id3.startsWith(`${id2}/bus.`)).to.eql(true);
      });

      it('duplex (by default)', () => {
        const source = rx.bus<E>();
        const target = rx.bus.clone<E>(source);

        const fired: Fired = { source: [], target: [] };
        source.$.subscribe((e) => fired.source.push(e));
        target.$.subscribe((e) => fired.target.push(e));

        source.fire({ type: 'foo', payload: { count: 123 } });
        expect(fired.source).to.eql(fired.target);
        expect(fired.source.length).to.eql(1);
        expect(fired.target.length).to.eql(1);

        target.fire({ type: 'foo', payload: { count: 456 } });
        expect(fired.source).to.eql(fired.target);
        expect(fired.source.length).to.eql(2);
        expect(fired.target.length).to.eql(2);
        expect(fired.source[1].payload.count).to.eql(456);
        expect(fired.target[1].payload.count).to.eql(456);
      });

      it('config: duplex filter', () => {
        const source = rx.bus<E>();
        const target = rx.bus.clone<E>(source, ($) => $.pipe(filter((e) => e.payload.count < 2)));

        let fired: Fired = { source: [], target: [] };
        source.$.subscribe((e) => fired.source.push(e));
        target.$.subscribe((e) => fired.target.push(e));

        source.fire({ type: 'foo', payload: { count: 1 } });
        source.fire({ type: 'foo', payload: { count: 2 } });

        expect(fired.source.length).to.eql(2);
        expect(fired.target.length).to.eql(1);
        expect(fired.source[0].payload.count).to.eql(1);
        expect(fired.source[1].payload.count).to.eql(2);
        expect(fired.target[0].payload.count).to.eql(1);

        fired = { source: [], target: [] };
        target.fire({ type: 'foo', payload: { count: 1 } });
        target.fire({ type: 'foo', payload: { count: 2 } });

        expect(fired.source.length).to.eql(1);
        expect(fired.target.length).to.eql(2);
        expect(fired.source[0].payload.count).to.eql(1);
        expect(fired.target[0].payload.count).to.eql(1);
        expect(fired.target[1].payload.count).to.eql(2);

        fired = { source: [], target: [] };
        source.fire({ type: 'foo', payload: { count: 888 } });

        expect(fired.source.length).to.eql(1); // NB: The source observable is not effected by the clone's filter.
        expect(fired.target.length).to.eql(0); // NB: Filter catches the count and does not propogate through target.

        fired = { source: [], target: [] };
        target.fire({ type: 'foo', payload: { count: 999 } });

        expect(fired.source.length).to.eql(0); // NB: The filter catches the count and does not propogate through up to the source.
        expect(fired.target.length).to.eql(1); // NB: The target was directly called so the subscription above fires, but there is not propogation to the source.
      });

      it('config: dispose$ (within config)', () => {
        const dispose$ = new Subject<void>();
        const source = rx.bus<E>();
        const target = rx.bus.clone<E>(source, ($) => $.pipe(takeUntil(dispose$)));

        let fired: Fired = { source: [], target: [] };
        source.$.subscribe((e) => fired.source.push(e));
        target.$.subscribe((e) => fired.target.push(e));

        dispose$.next();

        fired = { source: [], target: [] };
        source.fire({ type: 'foo', payload: { count: 0 } });
        expect(fired.source.length).to.eql(1); // NB: source observable not effected by the clone filter.
        expect(fired.target).to.eql([]);

        fired = { source: [], target: [] };
        target.fire({ type: 'foo', payload: { count: 0 } });
        expect(fired).to.eql({ source: [], target: [] });
      });

      it('config: source observable completes', () => {
        const source$ = new Subject<void>();
        const source = rx.bus<E>(source$);
        const target = rx.bus.clone<E>(source);

        const fired: Fired = { source: [], target: [] };
        source.$.subscribe((e) => fired.source.push(e));
        target.$.subscribe((e) => fired.target.push(e));

        source$.complete();

        source.fire({ type: 'foo', payload: { count: 123 } });
        target.fire({ type: 'foo', payload: { count: 456 } });
        expect(fired).to.eql({ source: [], target: [] });
      });

      it('config: source/target filters differ', () => {
        const source = rx.bus<E>();
        const target = rx.bus.clone<E>(source, {
          source: ($) => $.pipe(filter((e) => e.payload.count < 1)),
          target: ($) => $.pipe(filter((e) => e.payload.count > 1)),
        });

        let fired: Fired = { source: [], target: [] };
        source.$.subscribe((e) => fired.source.push(e));
        target.$.subscribe((e) => fired.target.push(e));

        source.fire({ type: 'foo', payload: { count: 0 } });
        source.fire({ type: 'foo', payload: { count: 2 } });

        expect(fired.source.length).to.eql(2);
        expect(fired.target.length).to.eql(1);
        expect(fired.target[0].payload.count).to.eql(0); // NB: Only the source [count < 1] was ferried to the target.

        fired = { source: [], target: [] };
        target.fire({ type: 'foo', payload: { count: 0 } });
        target.fire({ type: 'foo', payload: { count: 2 } });

        expect(fired.source.length).to.eql(1);
        expect(fired.target.length).to.eql(2);
        expect(fired.source[0].payload.count).to.eql(2); // NB: Only the target [count > 1] was ferried to the source.
      });

      it('throw: input not an event-bus', () => {
        const test = (input: any) => {
          const fn = () => rx.bus.clone(input);
          expect(fn).to.throw(/Input not an event-bus/);
        };
        test(undefined);
        test(null);
        test(123);
        test({});
        test([123, {}]);
        test({ event$: new Observable() });
        test({ $: new Observable() });
        test({ fire: () => null });
      });
    });
  });
});
