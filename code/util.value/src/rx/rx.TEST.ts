import * as t from '@platform/types';

import { expect } from 'chai';
import { Subject, Observable } from 'rxjs';

import { rx } from '.';
import { time } from '../time';

describe('rx', () => {
  describe('debounceBuffer', () => {
    it('buffers several values', async () => {
      type T = { value: number };
      const source$ = new Subject<T>();
      const buffered$ = rx.debounceBuffer(source$); // NB: default debounce time: 0

      let results: T[][] = [];
      buffered$.subscribe((e) => (results = [...results, e]));

      source$.next({ value: 1 });
      source$.next({ value: 2 });
      source$.next({ value: 3 });
      expect(results.length).to.eql(0);

      await time.wait(0);
      expect(results.length).to.eql(1);
      expect(results[0]).to.eql([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });

    it('buffers into two groups after delay', async () => {
      const source$ = new Subject<number>();
      const buffered$ = rx.debounceBuffer(source$, 10); // NB: default debounce time: 0

      let results: number[][] = [];
      buffered$.subscribe((e) => (results = [...results, e]));

      source$.next(1);
      source$.next(2);
      await time.wait(5); // NB: Still in the first debounce window.
      source$.next(3);

      await time.wait(10);
      source$.next(4);

      await time.wait(10);
      source$.next(5);
      source$.next(6);

      await time.wait(10);
      expect(results.length).to.eql(3);
      expect(results[0]).to.eql([1, 2, 3]);
      expect(results[1]).to.eql([4]);
      expect(results[2]).to.eql([5, 6]);
    });
  });

  describe('event: payload', () => {
    type FooEvent = { type: 'TYPE/foo'; payload: Foo };
    type Foo = { count: number };

    type BarEvent = { type: 'TYPE/bar'; payload: Bar };
    type Bar = { msg: string };

    it('rx.event', () => {
      const source$ = new Subject<FooEvent | BarEvent>();

      const fired: FooEvent[] = [];
      rx.event<FooEvent>(source$, 'TYPE/foo').subscribe((e) => fired.push(e));

      source$.next({ type: 'TYPE/bar', payload: { msg: 'hello' } });
      source$.next({ type: 'TYPE/foo', payload: { count: 123 } });
      source$.next({ type: 'TYPE/bar', payload: { msg: 'hello' } });

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('TYPE/foo');
      expect(fired[0].payload).to.eql({ count: 123 });
    });

    it('rx.payload', () => {
      const source$ = new Subject<FooEvent | BarEvent>();

      const fired: Foo[] = [];
      rx.payload<FooEvent>(source$, 'TYPE/foo').subscribe((e) => fired.push(e));

      source$.next({ type: 'TYPE/bar', payload: { msg: 'hello' } });
      source$.next({ type: 'TYPE/foo', payload: { count: 123 } });
      source$.next({ type: 'TYPE/bar', payload: { msg: 'hello' } });

      expect(fired.length).to.eql(1);
      expect(fired[0]).to.eql({ count: 123 });
    });
  });

  describe('bus', () => {
    type MyEvent = IFooEvent | IBarEvent;
    type IFooEvent = { type: 'Event/foo'; payload: { count?: number } };
    type IBarEvent = { type: 'Event/bar'; payload: { count?: number } };

    it('create: new observable (no param, no type)', () => {
      const bus = rx.bus();

      const fired: t.Event[] = [];
      bus.event$.subscribe((e) => fired.push(e));

      bus.fire({ type: 'ANY', payload: {} });

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('ANY');
    });

    it('create: use given subject', () => {
      const source$ = new Subject<any>(); // NB: Does not care the typing of the input observable (flexible).
      const bus = rx.bus<MyEvent>(source$);

      const fired: MyEvent[] = [];
      bus.event$.subscribe((e) => fired.push(e));

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

    it('changes event type', () => {
      const bus1 = rx.bus();

      const fired: t.Event[] = [];
      bus1.event$.subscribe((e) => fired.push(e));

      const bus2 = bus1.type<MyEvent>();
      bus2.fire({ type: 'Event/bar', payload: {} });

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('Event/bar');
    });

    it('filters out non-standard [event] objects from the stream', () => {
      const source$ = new Subject<any>();
      const bus = rx.bus<MyEvent>(source$);

      const fired: MyEvent[] = [];
      bus.event$.subscribe((e) => fired.push(e));

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

    it('filter', () => {
      const source$ = new Subject<MyEvent>();

      const fired: MyEvent[] = [];
      source$.subscribe((e) => fired.push(e));

      const bus1 = rx.bus<MyEvent>(source$);
      const bus2 = bus1.filter<IBarEvent>((e) => e.type === 'Event/bar');

      expect(bus1).to.not.equal(bus2); // NB: different instance.

      bus2.fire({ type: 'Event/foo', payload: {} } as any); // NB: This will be filtered out.
      expect(fired.length).to.eql(0);

      bus2.fire({ type: 'Event/bar', payload: {} }); // NB: this passes the filter.
      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('Event/bar');

      bus1.fire({ type: 'Event/foo', payload: {} }); // NB: original event bus not effected.
      expect(fired.length).to.eql(2);
      expect(fired[1].type).to.eql('Event/foo');
    });
  });

  describe('isBus', () => {
    it('is bus', () => {
      const test = (input: any) => {
        expect(rx.isBus(input)).to.eql(true);
      };
      test({ event$: new Observable(), fire: () => null });
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
      test({ fire: () => null });
    });
  });

  describe('isEvent', () => {
    const test = (input: any, expected: boolean) => {
      expect(rx.isEvent(input)).to.eql(expected);
    };

    it('is an event', () => {
      test({ type: 'MyEvent', payload: {} }, true);
    });

    it('is not an event', () => {
      test(undefined, false);
      test(null, false);
      test(1, false);
      test(true, false);
      test('two', false);
      test({}, false);
      test({ type: 123, payload: {} }, false);
      test({ type: 'FOO' }, false);
      test({ type: 'FOO', payload: 123 }, false);
    });
  });
});
