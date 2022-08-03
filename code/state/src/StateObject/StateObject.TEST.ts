import { isDraft } from 'immer';
import { Subject } from 'rxjs';

import { StateObject } from '.';
import { expect, t, time } from '../test';
import { StateObject as StateObjectClass } from './StateObject';

type IFoo = { message?: string; count: number; items?: any[] };
type IBar = { isEnabled?: boolean };

describe('StateObject', () => {
  describe('lifecycle', () => {
    it('create: store initial state', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);

      expect(obj.state).to.eql(initial);
      expect(obj.original).to.eql(initial);

      expect(obj.state).to.not.equal(initial); //    No change from initial.
      expect(obj.original).to.not.equal(initial); // No change from initial.
    });

    it('create: readonly version', () => {
      const obj = StateObject.create<IFoo>({ count: 0 });
      const readonly = obj.readonly;

      expect(readonly).to.be.an.instanceof(StateObjectClass);
      expect(readonly).to.equal(obj); // NB: Same instance, cast to narrower type.

      expect(StateObject.readonly(obj)).to.be.an.instanceof(StateObjectClass);
      expect(StateObject.readonly(readonly)).to.be.an.instanceof(StateObjectClass);
      expect(StateObject.readonly(obj)).to.equal(obj);
      expect(StateObject.readonly(readonly)).to.equal(obj);
    });

    it('dispose', () => {
      const obj = StateObject.create<IFoo>({ count: 1 });

      let count = 0;
      obj.dispose$.subscribe((e) => count++);

      expect(obj.isDisposed).to.eql(false);
      obj.dispose();
      obj.dispose();
      obj.dispose();

      expect(obj.isDisposed).to.eql(true);
      expect(count).to.eql(1);
    });

    it('dispose: events cease firing', () => {
      const obj = StateObject.create<IFoo>({ count: 1 });

      const fired: t.StateObjectEvent[] = [];
      obj.event.$.subscribe((e) => fired.push(e));

      obj.change((draft) => (draft.message = 'hello'));
      expect(fired.length).to.eql(2);

      obj.dispose();
      obj.dispose();
      obj.dispose();
      expect(obj.isDisposed).to.eql(true);
      expect(fired.length).to.eql(3);

      const event = fired[2] as t.IStateObjectDisposedEvent;
      expect(event.type).to.eql('StateObject/disposed');
      expect(event.payload.original).to.eql({ count: 1 });
      expect(event.payload.final).to.eql({ count: 1, message: 'hello' });

      obj.change((draft) => (draft.message = 'hello'));
      expect(fired.length).to.eql(3); // NB: no change.
    });
  });

  describe('static', () => {
    describe('toObject', () => {
      it('object', () => {
        const initial = { count: 0 };
        const obj = StateObject.create<IFoo>(initial);

        let original: IFoo | undefined;
        obj.change((draft) => {
          draft.count = 123;
          expect(draft.count).to.eql(123);
          original = StateObject.toObject(draft);
        });

        expect(isDraft(original)).to.eql(false);
        expect(original?.count).to.eql(0);
        expect(obj.state.count).to.eql(123);
      });

      it('array', () => {
        const initial = { count: 0, items: [] };
        const obj = StateObject.create<IFoo>(initial);

        let list: any;

        obj.change((draft) => {
          draft.items = [{ id: 1 }, { items: [[{ msg: 'hello' }]] }];
        });

        obj.change((draft) => {
          const items = draft.items || [];
          expect(items.length).to.eql(2);
          expect(isDraft(items[0])).to.eql(true);
          expect(isDraft(items[1])).to.eql(true);
          expect(draft.items).to.eql([{ id: 1 }, { items: [[{ msg: 'hello' }]] }]);
          list = StateObject.toObject(draft.items);
        });

        expect(list).to.eql([{ id: 1 }, { items: [[{ msg: 'hello' }]] }]);
        expect(isDraft(list[0])).to.eql(false);
        expect(isDraft(list[1])).to.eql(false);
      });

      it('undefined', () => {
        const initial = { count: 0 };
        const obj = StateObject.create<IFoo>(initial);

        let list: string[] | undefined;
        obj.change((draft) => {
          list = StateObject.toObject(draft.items);
        });

        expect(list).to.eql(undefined);
      });
    });

    it('isStateObject', () => {
      const test = (input: any, expected: boolean) => {
        const res = StateObject.isStateObject(input);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test(null, false);
      test('', false);
      test(123, false);
      test(true, false);
      test({}, false);

      const obj = StateObject.create<IFoo>({ count: 0 });
      test(obj, true);
    });

    it('isProxy', async () => {
      const test = (input: any, expected: boolean) => {
        const res = StateObject.isProxy(input);
        expect(res).to.eql(expected);
      };
      const obj = StateObject.create<IFoo>({ count: 0 });

      test(undefined, false);
      test(null, false);
      test('', false);
      test(123, false);
      test(true, false);
      test({}, false);
      test(obj, false);

      obj.change((draft) => test(draft, true));
      await obj.changeAsync(async (draft) => test(draft, true));
    });
  });

  describe('change', () => {
    it('sync/change: update (via function)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);
      expect(obj.state).to.equal(obj.original); // NB: Same instance (no change yet).

      const res1 = obj.change((draft) => {
        draft.count += 2;
        draft.message = 'hello';
      });
      const res2 = obj.change((draft) => (draft.count += 1));

      expect(res1.op).to.eql('update');
      expect(res1.cid.length).to.greaterThan(4);
      expect(res2.cid.length).to.greaterThan(4);
      expect(res1.cid).to.not.eql(res2.cid);

      expect(obj.state).to.eql({ count: 4, message: 'hello' });
      expect(obj.state).to.not.equal(obj.original); // NB: Different (changed) instance.

      expect(res1.changed?.from).to.eql({ count: 1 });
      expect(res1.changed?.to).to.eql({ count: 3, message: 'hello' });
      expect(res1.cancelled).to.eql(undefined);

      expect(res2.op).to.eql('update');
      expect(res2.changed?.from).to.eql({ count: 3, message: 'hello' });
      expect(res2.changed?.to).to.eql({ count: 4, message: 'hello' });
      expect(res2.cancelled).to.eql(undefined);

      expect(obj.original).to.eql(initial);
    });

    it('sync/change: replace (via {object} value)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);
      expect(obj.state).to.equal(obj.original); // NB: Same instance (no change yet).

      const res1 = obj.change({ count: 2, message: 'hello' });

      expect(res1.op).to.eql('replace');
      expect(res1.changed?.from).to.eql({ count: 1 });
      expect(res1.changed?.to).to.eql({ count: 2, message: 'hello' });
      expect(obj.state).to.eql({ count: 2, message: 'hello' });

      const res2 = obj.change({ count: 3 });

      expect(res2.op).to.eql('replace');
      expect(res2.changed?.from).to.eql({ count: 2, message: 'hello' });
      expect(res2.changed?.to).to.eql({ count: 3 });
      expect(obj.state).to.eql({ count: 3 });

      expect(obj.original).to.eql(initial);
    });

    it('sync/change: disconnected method function can be passed around (bound)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);
      const change = obj.change;
      const increment = () => change((draft) => draft.count++);

      expect(obj.state.count).to.eql(1);

      change((draft) => (draft.count -= 1));
      expect(obj.state.count).to.eql(0);

      change({ count: 99 });
      expect(obj.state.count).to.eql(99);

      increment();
      increment();
      expect(obj.state.count).to.eql(101);

      expect(obj.original).to.eql(initial);
    });

    it('change (async)', async () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);

      const { changeAsync } = obj; // NB: Can be disconnected.

      const res = await changeAsync(async (draft) => {
        await time.wait(10);
        draft.count++;
        return 'NO EFFECT' as any;
      });

      expect(res.op).to.eql('update');
      expect(res.changed?.from).to.eql({ count: 1 });
      expect(res.changed?.to).to.eql({ count: 2 });

      expect(res.patches.prev[0]).to.eql({ op: 'replace', path: 'count', value: 1 });
      expect(res.patches.next[0]).to.eql({ op: 'replace', path: 'count', value: 2 });
    });

    it('no change (does not fire events)', () => {
      const initial = { count: 0 };
      const obj = StateObject.create<IFoo>(initial);

      let changing = 0;
      let changed = 0;
      obj.event.changing$.subscribe((e) => changing++);
      obj.event.changed$.subscribe((e) => changed++);

      const test = (changer: t.StateChanger<IFoo>) => {
        const res = obj.change(changer);

        expect(changing).to.eql(0);
        expect(changed).to.eql(0);

        expect(obj.state).to.eql(initial);
        expect(res.changed).to.eql(undefined);
        expect(res.cancelled).to.eql(undefined);
      };

      test((draft) => undefined); //         NB: Touched nothing.
      test((draft) => (draft.count = 0)); // NB: Set to same value.
    });

    it('throw: when property name contains "/"', () => {
      // NB: "/" characters in property names confuse the [patch] path values.
      //     Just don't use them!
      type T = { 'foo/bar'?: number };
      const obj = StateObject.create<T>({});
      const fn = () => obj.change((draft) => (draft['foo/bar'] = 123));
      expect(fn).to.throw(/Property names cannot contain the "\/" character/);
    });
  });

  describe('patches', () => {
    type M = { foo: IFoo; bar?: IFoo };

    it('no change', () => {
      const obj = StateObject.create<IFoo>({ count: 1 });
      const res = obj.change((draft) => undefined);
      expect(obj.state.count).to.eql(1);
      expect(res.patches.next).to.eql([]);
      expect(res.patches.prev).to.eql([]);
    });

    it('update', () => {
      const initial: M = { foo: { count: 1 } };
      const obj = StateObject.create<M>(initial);
      const res = obj.change((draft) => {
        draft.foo.count++;
        draft.foo.message = 'hello';
        draft.bar = { count: 9 };
        return 123; // NB: return value is ignored.
      });

      expect(res.op).to.eql('update');
      expect(res.changed?.to.foo.count).to.eql(2);
      expect(res.changed?.to.foo.message).to.eql('hello');

      const { next, prev } = res.patches;
      expect(next.length).to.eql(3);
      expect(prev.length).to.eql(3);

      expect(prev[0]).to.eql({ op: 'replace', path: 'foo/count', value: 1 });
      expect(prev[1]).to.eql({ op: 'remove', path: 'foo/message' });
      expect(prev[2]).to.eql({ op: 'remove', path: 'bar' });

      expect(next[0]).to.eql({ op: 'replace', path: 'foo/count', value: 2 });
      expect(next[1]).to.eql({ op: 'add', path: 'foo/message', value: 'hello' });
      expect(next[2]).to.eql({ op: 'add', path: 'bar', value: { count: 9 } });
    });

    it('replace', () => {
      const obj = StateObject.create<IFoo>({ count: 0 });
      const res = obj.change({ count: 888 });

      expect(res.op).to.eql('replace');
      obj.change({ count: 5, message: 'hello' });

      const { next, prev } = res.patches;
      expect(next.length).to.eql(1);
      expect(prev.length).to.eql(1);

      expect(prev[0]).to.eql({ op: 'replace', path: '', value: { count: 0 } });
      expect(next[0]).to.eql({ op: 'replace', path: '', value: { count: 888 } });
    });
  });

  describe('events', () => {
    it('event: changing', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);

      const events: t.StateObjectEvent[] = [];
      const changing: t.IStateObjectChanging[] = [];

      obj.event.$.subscribe((e) => events.push(e));
      obj.event.changing$.subscribe((e) => changing.push(e));

      const res = obj.change((draft) => (draft.count += 1));
      expect(obj.state.count).to.eql(2);

      expect(events.length).to.eql(2);
      expect(changing.length).to.eql(1);

      expect(events[0].type).to.eql('StateObject/changing');
      expect(events[1].type).to.eql('StateObject/changed');

      const event = changing[0];
      expect(event.op).to.eql('update');
      expect(event.cancelled).to.eql(false);
      expect(event.from).to.eql(initial);
      expect(event.to).to.eql({ count: 2 });
      expect(event.patches).to.eql(res.patches);
    });

    it('event: changing (cancelled)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);

      const cancelled: t.IStateObjectCancelled[] = [];
      const changing: t.IStateObjectChanging[] = [];
      const changed: t.IStateObjectChanged[] = [];

      obj.event.cancelled$.subscribe((e) => cancelled.push(e));
      obj.event.changed$.subscribe((e) => changed.push(e));
      obj.event.changing$.subscribe((e) => {
        changing.push(e);
        e.cancel();
      });

      obj.change((draft) => (draft.count += 1));
      expect(changing.length).to.eql(1);
      expect(cancelled.length).to.eql(1);
      expect(changed.length).to.eql(0);

      obj.change({ count: 2 });
      expect(changing.length).to.eql(2);
      expect(cancelled.length).to.eql(2);
      expect(changed.length).to.eql(0);

      expect(obj.state).to.eql(initial); // NB: No change (because it was cancelled).
      expect(obj.state).to.equal(obj.original);
    });

    it('event: changed', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);

      const events: t.StateObjectEvent[] = [];
      const changing: t.IStateObjectChanging[] = [];
      const changed: t.IStateObjectChanged[] = [];
      obj.event.$.subscribe((e) => events.push(e));
      obj.event.changing$.subscribe((e) => changing.push(e));
      obj.event.changed$.subscribe((e) => changed.push(e));

      const res = obj.change((draft) => draft.count++);

      expect(events.length).to.eql(2);
      expect(changed.length).to.eql(1);

      const event = changed[0];
      expect(event.op).to.eql('update');
      expect(event.from).to.eql(initial);
      expect(event.to).to.eql({ count: 2 });
      expect(event.to).to.equal(obj.state); // NB: Current state instance.
      expect(event.patches).to.eql(res.patches);

      expect(changing[0].cid).to.eql(changed[0].cid);
    });

    it('event: changing/changed (via "replace" operation)', () => {
      const obj = StateObject.create<IFoo>({ count: 1 });

      const changing: t.IStateObjectChanging[] = [];
      const changed: t.IStateObjectChanged[] = [];
      obj.event.changing$.subscribe((e) => changing.push(e));
      obj.event.changed$.subscribe((e) => changed.push(e));

      obj.change({ count: 888 });
      expect(changing.length).to.eql(1);
      expect(changed.length).to.eql(1);

      expect(changing[0].op).to.eql('replace');
      expect(changed[0].op).to.eql('replace');

      expect(changing[0].patches).to.eql(changed[0].patches);

      const patches = changed[0].patches;
      expect(patches.prev[0]).to.eql({ op: 'replace', path: '', value: { count: 1 } });
      expect(patches.next[0]).to.eql({ op: 'replace', path: '', value: { count: 888 } });
    });

    it('event: changedPatches', () => {
      const obj = StateObject.create<IFoo>({ count: 1 });

      const patches: t.IStateObjectPatched[] = [];
      obj.event.patched$.subscribe((e) => patches.push(e));

      obj.change({ count: 888 });

      expect(patches.length).to.eql(1);

      const e = patches[0];
      expect(e.op).to.eql('replace');

      expect(e.prev[0]).to.eql({ op: 'replace', path: '', value: { count: 1 } });
      expect(e.next[0]).to.eql({ op: 'replace', path: '', value: { count: 888 } });
    });
  });

  describe('combine', () => {
    type T = { foo: IFoo; bar: IBar };

    it('create: from initial {object} values', () => {
      const initial = { foo: { count: 0 }, bar: {} };
      const combined = StateObject.combine<T>(initial);
      expect(combined.store.state).to.eql(combined.state);
      expect(combined.state).to.eql(initial);
    });

    it('create: from initial {state-object} values', () => {
      const foo = StateObject.create<IFoo>({ count: 123 });
      const bar = StateObject.create<IBar>({ isEnabled: true });
      const combined = StateObject.combine<T>({ foo, bar });
      expect(combined.state.foo).to.eql({ count: 123 });
      expect(combined.state.bar).to.eql({ isEnabled: true });

      foo.change((draft) => draft.count++);
      expect(combined.state.foo.count).to.eql(124);
    });

    it('exposes [changed$] events', () => {
      const combined = StateObject.combine<T>({ foo: { count: 0 }, bar: {} });
      expect(combined.changed$).to.equal(combined.store.event.changed$);
    });

    it('add: sync values', () => {
      const initial = { foo: { count: 0 }, bar: {} };
      const bar = StateObject.create<IBar>({ isEnabled: true });

      const combined = StateObject.combine<T>(initial);
      expect(combined.state.bar.isEnabled).to.eql(undefined);

      combined.add('bar', bar);
      expect(combined.store.state).to.eql(combined.state);
      expect(combined.state.bar.isEnabled).to.eql(true);
    });

    it('change: sync values', () => {
      const initial = { foo: { count: 0 }, bar: {} };
      const foo = StateObject.create<IFoo>({ count: 1 });
      const bar = StateObject.create<IBar>({});
      const combined = StateObject.combine<T>(initial).add('bar', bar).add('foo', foo);
      expect(combined.state).to.eql({ foo: { count: 1 }, bar: {} });

      foo.change((draft) => {
        draft.count = 123;
        draft.message = 'hello';
      });
      bar.change({ isEnabled: true });

      expect(combined.state.foo).to.eql({ count: 123, message: 'hello' });
      expect(combined.state.bar).to.eql({ isEnabled: true });
    });

    it('dispose$ (param)', () => {
      const dispose$ = new Subject<void>();
      const combined = StateObject.combine<T>({ foo: { count: 0 }, bar: {} }, dispose$);
      expect(combined.store.isDisposed).to.eql(false);

      dispose$.next();
      expect(combined.store.isDisposed).to.eql(true);
    });

    it('stop syncing on [store.dispose]', () => {
      const initial = { foo: { count: 0 }, bar: {} };
      const foo = StateObject.create<IFoo>({ count: 1 });
      const bar = StateObject.create<IBar>({});
      const combined = StateObject.combine<T>(initial).add('bar', bar).add('foo', foo);

      foo.change((draft) => draft.count++);
      bar.change((draft) => (draft.isEnabled = !draft.isEnabled));

      expect(combined.state.foo.count).to.eql(2);
      expect(combined.state.bar.isEnabled).to.eql(true);

      combined.dispose();

      foo.change((draft) => draft.count++);
      expect(combined.state.foo.count).to.eql(2); // NB: no change.
    });
  });
});
