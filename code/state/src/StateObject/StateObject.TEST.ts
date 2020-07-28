/* eslint-disable */
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { StateObject } from '.';
import { expect, t } from '../test';
import { StateObject as StateObjectClass } from './StateObject';

type IFoo = { message?: string; count: number };
type IBar = { isEnabled?: boolean };
type MyEvent = IncrementEvent | DecrementEvent;
type IncrementEvent = { type: 'INCREMENT'; payload: { by: number } };
type DecrementEvent = { type: 'DECREMENT'; payload: { by: number } };

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

    it('create: dispatchable version', () => {
      const obj = StateObject.create<IFoo>({ count: 0 });
      const dispatchable = obj.dispatchable;

      expect(dispatchable).to.be.an.instanceof(StateObjectClass);
      expect(dispatchable).to.equal(obj); // NB: Same instance, cast to narrower type.

      expect(typeof dispatchable.dispatch === 'function').to.eql(true);
      expect(typeof dispatchable.action === 'function').to.eql(true);
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

      let fired: t.StateObjectEvent[] = [];
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

  describe('change', () => {
    it('change: update (via function)', () => {
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

    it('no change (does not fire events)', () => {
      const initial = { count: 0 };
      const obj = StateObject.create<IFoo>(initial);

      let changing = 0;
      let changed = 0;
      obj.event.changing$.subscribe((e) => changing++);
      obj.event.changed$.subscribe((e) => changed++);

      const test = (changer: t.StateObjectChanger<IFoo>) => {
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

    it('change: replace (via {object} value)', () => {
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

    it('change: disconnected method function can be passed around (bound)', () => {
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
      const obj = StateObject.create<IFoo, MyEvent>(initial);

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
      expect(event.action).to.eql('');
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
      expect(event.action).to.equal('');
      expect(event.patches).to.eql(res.patches);

      expect(changing[0].cid).to.eql(changed[0].cid);
    });

    it('event: changed (via [action.changed] filter method)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo, MyEvent>(initial);
      const done$ = new Subject();

      const fired: t.IStateObjectChanged<IFoo, MyEvent>[] = [];
      obj
        .action(done$)
        .changed('INCREMENT')
        .subscribe((e) => fired.push(e));

      // Change: Not issuing 'action'.
      obj.change((draft) => draft.count++);
      obj.change((draft) => draft.count++);
      expect(obj.state.count).to.eql(3);
      expect(fired.length).to.eql(0); // NB: Because action was issued on change.

      // Change: Action issued, but different from what is being listened for.
      obj.change((draft) => draft.count--, 'DECREMENT');
      expect(obj.state.count).to.eql(2);
      expect(fired.length).to.eql(0); // NB: Because different action.

      // Change with action.
      obj.change((draft) => draft.count++, 'INCREMENT');
      expect(obj.state.count).to.eql(3);
      expect(fired.length).to.eql(1);
      expect(fired[0].from.count).to.eql(2);
      expect(fired[0].to.count).to.eql(3);

      // Stop listening.
      done$.next();
      obj.change((draft) => draft.count++, 'INCREMENT');
      obj.change((draft) => draft.count++, 'INCREMENT');
      expect(obj.state.count).to.eql(5);
      expect(fired.length).to.eql(1); // NB: No change.
    });

    it('event: changing/changed (with "action")', () => {
      const obj = StateObject.create<IFoo, MyEvent>({ count: 1 });

      const changing: t.IStateObjectChanging[] = [];
      const changed: t.IStateObjectChanged[] = [];
      const actions: t.IStateObjectChanged[] = [];
      obj.event.changing$.subscribe((e) => changing.push(e));
      obj.event.changed$.subscribe((e) => changed.push(e));
      obj.event.changed$
        .pipe(filter((e) => e.action === 'INCREMENT'))
        .subscribe((e) => actions.push(e));

      obj.change((draft) => (draft.message = 'hello'));
      expect(changing.length).to.eql(1);
      expect(changed.length).to.eql(1);
      expect(actions.length).to.eql(0);

      obj.change((draft) => draft.count++, 'INCREMENT');
      expect(changing.length).to.eql(2);
      expect(changed.length).to.eql(2);
      expect(actions.length).to.eql(1);

      expect(changing[0].action).to.eql('');
      expect(changing[1].action).to.eql('INCREMENT');

      expect(changed[0].action).to.eql('');
      expect(changed[1].action).to.eql('INCREMENT');
    });

    it('event: changing/changed (via "replace" operation)', () => {
      const obj = StateObject.create<IFoo, MyEvent>({ count: 1 });

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

    it('event: dispatch', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo, MyEvent>(initial);
      const dispatch = obj.dispatch; // NB: Test disconnected "bound" method.

      const dispatched: MyEvent[] = [];
      const changed: t.IStateObjectChanged[] = [];
      obj.event.dispatch$.subscribe((e) => dispatched.push(e));
      obj.event.changed$.subscribe((e) => changed.push(e));

      obj.dispatch({ type: 'INCREMENT', payload: { by: 1 } });

      expect(dispatched.length).to.eql(1);
      expect(changed.length).to.eql(0);

      obj.event.dispatch$
        .pipe(
          filter((e) => e.type === 'INCREMENT'),
          map((e) => e.payload as IncrementEvent['payload']),
        )
        .subscribe((e) => {
          obj.change((m) => (m.count += e.by), 'INCREMENT');
        });

      dispatch({ type: 'INCREMENT', payload: { by: 2 } }); // NB: Using disconnected method.

      expect(dispatched.length).to.eql(2);
      expect(changed.length).to.eql(1);
      expect(changed[0].action).to.eql('INCREMENT');
      expect(obj.state.count).to.eql(3);
    });

    it('event: dispatch (via [action.dispatched] method filter)', async () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo, MyEvent>(initial);
      const { dispatch, action } = obj; // NB: Test disconnected "bound" method.
      const done$ = new Subject();

      action(done$)
        .dispatched('INCREMENT')
        .pipe(filter((e) => e.by >= 5))
        .subscribe((e) => obj.change((m) => (m.count += e.by)));

      // NB: Fired below change threshold.
      dispatch({ type: 'INCREMENT', payload: { by: 1 } });
      dispatch({ type: 'INCREMENT', payload: { by: 2 } });
      dispatch({ type: 'INCREMENT', payload: { by: 3 } });
      dispatch({ type: 'INCREMENT', payload: { by: 4 } });
      expect(obj.state.count).to.eql(1);

      // Fire above change threshold.
      dispatch({ type: 'INCREMENT', payload: { by: 5 } });
      expect(obj.state.count).to.eql(6);

      done$.next();
      dispatch({ type: 'INCREMENT', payload: { by: 5 } });
      expect(obj.state.count).to.eql(6); // NB: No change.
    });
  });

  describe('merge', () => {
    type T = { foo: IFoo; bar: IBar };

    it('create: from initial {object} values', () => {
      const initial = { foo: { count: 0 }, bar: {} };
      const merged = StateObject.merge<T>(initial);
      expect(merged.store.state).to.eql(merged.state);
      expect(merged.state).to.eql(initial);
    });

    it('create: from initial {state-object} values', () => {
      const foo = StateObject.create<IFoo>({ count: 123 });
      const bar = StateObject.create<IBar>({ isEnabled: true });
      const merged = StateObject.merge<T>({ foo, bar });
      expect(merged.state.foo).to.eql({ count: 123 });
      expect(merged.state.bar).to.eql({ isEnabled: true });

      foo.change((draft) => draft.count++);
      expect(merged.state.foo.count).to.eql(124);
    });

    it('exposes [changed$] events', () => {
      const merged = StateObject.merge<T>({ foo: { count: 0 }, bar: {} });
      expect(merged.changed$).to.equal(merged.store.event.changed$);
    });

    it('add: sync values', () => {
      const initial = { foo: { count: 0 }, bar: {} };
      const bar = StateObject.create<IBar>({ isEnabled: true });

      const merged = StateObject.merge<T>(initial);
      expect(merged.state.bar.isEnabled).to.eql(undefined);

      merged.add('bar', bar);
      expect(merged.store.state).to.eql(merged.state);
      expect(merged.state.bar.isEnabled).to.eql(true);
    });

    it('change: sync values', () => {
      const initial = { foo: { count: 0 }, bar: {} };
      const foo = StateObject.create<IFoo>({ count: 1 });
      const bar = StateObject.create<IBar>({});
      const merged = StateObject.merge<T>(initial).add('bar', bar).add('foo', foo);
      expect(merged.state).to.eql({ foo: { count: 1 }, bar: {} });

      foo.change((draft) => {
        draft.count = 123;
        draft.message = 'hello';
      });
      bar.change({ isEnabled: true });

      expect(merged.state.foo).to.eql({ count: 123, message: 'hello' });
      expect(merged.state.bar).to.eql({ isEnabled: true });
    });

    it('dispose$ (param)', () => {
      const dispose$ = new Subject();
      const merged = StateObject.merge<T>({ foo: { count: 0 }, bar: {} }, dispose$);
      expect(merged.store.isDisposed).to.eql(false);

      dispose$.next();
      expect(merged.store.isDisposed).to.eql(true);
    });

    it('stop syncing on [store.dispose]', () => {
      const initial = { foo: { count: 0 }, bar: {} };
      const foo = StateObject.create<IFoo>({ count: 1 });
      const bar = StateObject.create<IBar>({});
      const merged = StateObject.merge<T>(initial).add('bar', bar).add('foo', foo);

      foo.change((draft) => draft.count++);
      bar.change((draft) => (draft.isEnabled = !Boolean(draft.isEnabled)));

      expect(merged.state.foo.count).to.eql(2);
      expect(merged.state.bar.isEnabled).to.eql(true);

      // merged.store.
      merged.dispose();

      foo.change((draft) => draft.count++);
      expect(merged.state.foo.count).to.eql(2); // NB: no change.
    });
  });
});
