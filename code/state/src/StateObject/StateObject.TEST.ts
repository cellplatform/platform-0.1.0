/* eslint-disable */
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { StateObject } from '.';
import { expect, t } from '../test';
import { StateObject as StateObjectClass } from './StateObject';

type IFoo = { message?: string; count: number };
type MyEvent = IncrementEvent | DecrementEvent;
type IncrementEvent = { type: 'INCREMENT'; payload: { by: number } };
type DecrementEvent = { type: 'DECREMENT'; payload: { by: number } };

describe.only('StateObject', () => {
  describe('create', () => {
    it('store initial state', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);

      expect(obj.state).to.eql(initial);
      expect(obj.original).to.eql(initial);

      expect(obj.state).to.not.equal(initial); //    No change from initial.
      expect(obj.original).to.not.equal(initial); // No change from initial.
    });

    it('readonly version', () => {
      const obj = StateObject.create<IFoo>({ count: 0 });
      const readonly = obj.readonly;

      expect(readonly).to.be.an.instanceof(StateObjectClass);
      expect(readonly).to.equal(obj); // NB: Same instance, cast to narrower type.

      expect(StateObject.readonly(obj)).to.be.an.instanceof(StateObjectClass);
      expect(StateObject.readonly(readonly)).to.be.an.instanceof(StateObjectClass);
      expect(StateObject.readonly(obj)).to.equal(obj);
      expect(StateObject.readonly(readonly)).to.equal(obj);
    });
  });

  describe('change', () => {
    it('update (function)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);
      expect(obj.state).to.equal(obj.original); // NB: Same instance (no change yet).

      const res1 = obj.change((draft) => {
        draft.count += 2;
        draft.message = 'hello';
      });
      const res2 = obj.change((draft) => (draft.count += 1));

      expect(res1.cid.length).to.greaterThan(4);
      expect(res2.cid.length).to.greaterThan(4);
      expect(res1.cid).to.not.eql(res2.cid);

      expect(obj.state).to.eql({ count: 4, message: 'hello' });
      expect(obj.state).to.not.equal(obj.original); // NB: Different (changed) instance.

      expect(res1.from).to.eql({ count: 1 });
      expect(res1.to).to.eql({ count: 3, message: 'hello' });
      expect(res1.cancelled).to.eql(false);

      expect(res2.from).to.eql({ count: 3, message: 'hello' });
      expect(res2.to).to.eql({ count: 4, message: 'hello' });
      expect(res2.cancelled).to.eql(false);

      expect(obj.original).to.eql(initial);
    });

    it('replace (object)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);
      expect(obj.state).to.equal(obj.original); // NB: Same instance (no change yet).

      const res1 = obj.change({ count: 2, message: 'hello' });

      expect(res1.from).to.eql({ count: 1 });
      expect(res1.to).to.eql({ count: 2, message: 'hello' });
      expect(obj.state).to.eql({ count: 2, message: 'hello' });

      const res2 = obj.change({ count: 3 });

      expect(res2.from).to.eql({ count: 2, message: 'hello' });
      expect(res2.to).to.eql({ count: 3 });
      expect(obj.state).to.eql({ count: 3 });

      expect(obj.original).to.eql(initial);
    });

    it('[change] method disconnected can be passed around', async () => {
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
  });

  describe('events', () => {
    it('event: changing', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo, MyEvent>(initial);

      const events: t.StateObjectEvent[] = [];
      const changing: t.IStateObjectChanging[] = [];

      obj.event$.subscribe((e) => events.push(e));
      obj.changing$.subscribe((e) => changing.push(e));

      obj.change((draft) => (draft.count += 1));

      expect(obj.state.count).to.eql(2);

      expect(events.length).to.eql(2);
      expect(changing.length).to.eql(1);

      expect(events[0].type).to.eql('StateObject/changing');
      expect(events[1].type).to.eql('StateObject/changed');

      expect(changing[0].cancelled).to.eql(false);
      expect(changing[0].action).to.eql('');
      expect(changing[0].from).to.eql(initial);
      expect(changing[0].to).to.eql({ count: 2 });
    });

    it('event: changing (cancelled)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo>(initial);

      const cancelled: t.IStateObjectCancelled[] = [];
      const changing: t.IStateObjectChanging[] = [];
      const changed: t.IStateObjectChanged[] = [];

      obj.cancelled$.subscribe((e) => cancelled.push(e));
      obj.changed$.subscribe((e) => changed.push(e));
      obj.changing$.subscribe((e) => {
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
      obj.event$.subscribe((e) => events.push(e));
      obj.changing$.subscribe((e) => changing.push(e));
      obj.changed$.subscribe((e) => changed.push(e));

      obj.change((draft) => (draft.count += 1));

      expect(events.length).to.eql(2);
      expect(changed.length).to.eql(1);

      const event = changed[0];
      expect(event.from).to.eql(initial);
      expect(event.to).to.eql({ count: 2 });
      expect(event.to).to.equal(obj.state); // NB: Current state instance.
      expect(event.action).to.equal('');

      expect(changing[0].cid).to.eql(changed[0].cid);
    });

    it('event: changing/changed (with action)', () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo, MyEvent>(initial);

      const changing: t.IStateObjectChanging[] = [];
      const changed: t.IStateObjectChanged[] = [];
      const actions: t.IStateObjectChanged[] = [];
      obj.changing$.subscribe((e) => changing.push(e));
      obj.changed$.subscribe((e) => changed.push(e));
      obj.changed$.pipe(filter((e) => e.action === 'INCREMENT')).subscribe((e) => actions.push(e));

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

    it('event: dispatch', async () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo, MyEvent>(initial);
      const dispatch = obj.dispatch; // NB: Test disconnected "bound" method.

      const dispatched: MyEvent[] = [];
      const changed: t.IStateObjectChanged[] = [];
      obj.dispatch$.subscribe((e) => dispatched.push(e));
      obj.changed$.subscribe((e) => changed.push(e));

      obj.dispatch({ type: 'INCREMENT', payload: { by: 1 } });

      expect(dispatched.length).to.eql(1);
      expect(changed.length).to.eql(0);

      obj.dispatch$
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

    it('event: dispatch (via [dispatched] method filter)', async () => {
      const initial = { count: 1 };
      const obj = StateObject.create<IFoo, MyEvent>(initial);
      const { dispatch, dispatched } = obj; // NB: Test disconnected "bound" method.
      const done$ = new Subject();

      dispatched('INCREMENT', done$)
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
});
