import { time } from '@platform/util.value';
import { expect } from 'chai';

import { Store } from '.';
import * as t from './types';

export type IMyModel = { count: number; foo: IMyFoo };
export type IMyFoo = { list: number[]; msg?: string };
const initial: IMyModel = { count: 0, foo: { list: [] } };

export type MyEvent = IIncrementEvent | IDecrementEvent | IChangeFooEvent;
export type IIncrementEvent = {
  type: 'TEST/increment';
  payload: { by: number };
};
export type IDecrementEvent = {
  type: 'TEST/decrement';
  payload: { by: number };
};
export type IChangeFooEvent = {
  type: 'TEST/changeFoo';
  payload: {};
};

describe('Store', () => {
  describe('lifecycle', () => {
    it('constructs', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      expect(store.isDisposed).to.eql(false);
      expect(store.state).to.not.equal(initial);
      expect(store.state).to.eql(initial);
    });

    it('disposes', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });

      let count = 0;
      store.dispose$.subscribe(() => count++);

      store.dispose();
      store.dispose();
      expect(store.isDisposed).to.eql(true);
      expect(count).to.eql(1);
    });
  });

  describe('state', () => {
    it('returns new immutable object from [state] property', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const state1 = store.state;
      const state2 = store.state;

      expect(store.state).to.eql(initial);
      expect(store.state).to.not.equal(initial);

      expect(state1).to.eql(store.state);
      expect(state1).to.eql(initial);

      expect(state1).to.not.equal(state2);

      expect(store.state).to.not.equal(initial);
    });
  });

  describe('dispatch', () => {
    it('returns the state object', () => {
      const state = Store.create<IMyModel, MyEvent>({ initial });
      const res = state.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(res).to.equal(res);
    });

    it('fires dispatch event', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const events: t.IDispatch[] = [];
      store.events$.subscribe(e => events.push(e));

      store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      store.dispatch({ type: 'TEST/decrement', payload: { by: 2 } });

      expect(events.length).to.eql(2);
      expect(events[0].type).to.eql('TEST/increment');
      expect(events[1].type).to.eql('TEST/decrement');
    });

    it('returns copy of the current state object on event', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });

      const states: IMyModel[] = [];
      store.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        states.push(e.state);
        states.push(e.state);
      });

      store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });

      expect(states.length).to.eql(2);
      expect(states[0]).to.eql(store.state); // NB: Equivalent.
      expect(states[1]).to.eql(store.state); // NB: Equivalent.

      // Not the same instance.
      expect(states[0]).to.not.equal(store.state);
      expect(states[1]).to.not.equal(store.state);
      expect(states[0]).to.not.equal(states[1]); // NB: Different copies returned from repeat calls to 'state' property.
    });

    it('changes the current state', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      expect(store.state.count).to.eql(0);

      store.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        const count = e.state.count + e.payload.by;
        const next = { ...e.state, count };
        e.change(next);
      });

      store.on<IDecrementEvent>('TEST/decrement').subscribe(e => {
        const count = e.state.count - e.payload.by;
        const next = { ...e.state, count };
        e.change(next);
      });

      store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(store.state.count).to.eql(1);

      store.dispatch({ type: 'TEST/decrement', payload: { by: 2 } });
      expect(store.state.count).to.eql(-1);
    });

    it('fires [changing] event', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const events: t.IStateChanging[] = [];
      store.changing$.subscribe(e => events.push(e));

      store.on<IIncrementEvent>('TEST/increment').subscribe(e => e.change(e.state));
      store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });

      expect(events.length).to.eql(1);
      expect(events[0].isCancelled).to.eql(false);
      expect(events[0].change.type).to.eql('TEST/increment');
    });

    it('cancels change', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });

      let cancel = false;
      store.changing$.subscribe(e => {
        if (cancel) {
          e.cancel();
        }
      });

      store.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        if (e.payload.by > 0) {
          const count = e.state.count + e.payload.by;
          const next = { ...e.state, count };
          e.change(next);
        }
      });

      expect(store.state.count).to.eql(0);
      store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(store.state.count).to.eql(1);

      cancel = true;
      store.dispatch({ type: 'TEST/increment', payload: { by: 99 } });
      expect(store.state.count).to.eql(1); // No change.
    });

    it('fires [changed] event', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const events: Array<t.IStateChange<any, any>> = [];
      store.changed$.subscribe(e => events.push(e));

      store.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        if (e.payload.by > 0) {
          const count = e.state.count + e.payload.by;
          const next = { ...e.state, count };
          e.change(next);
        }
      });

      store.dispatch({ type: 'TEST/increment', payload: { by: 90 } });
      store.dispatch({ type: 'TEST/increment', payload: { by: 0 } }); // No change.
      store.dispatch({ type: 'TEST/increment', payload: { by: 2 } });

      expect(events.length).to.eql(2);

      const change1: t.IStateChange<IMyModel, IIncrementEvent> = events[0];
      const change2: t.IStateChange<IMyModel, IIncrementEvent> = events[1];

      expect(change1.type).to.eql('TEST/increment');
      expect(change1.event.type).to.eql('TEST/increment');
      expect(change1.event.payload.by).to.eql(90);

      expect(change2.type).to.eql('TEST/increment');
      expect(change2.event.type).to.eql('TEST/increment');
      expect(change2.event.payload.by).to.eql(2);

      expect(change1.from.count).to.eql(0);
      expect(change1.to.count).to.eql(90);

      expect(change2.from.count).to.eql(90);
      expect(change2.to.count).to.eql(92);
    });
  });

  describe('epics', () => {
    it('dispatches a follow-on event  (sync)', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const events: t.IDispatch[] = [];
      store.events$.subscribe(e => events.push(e));

      store.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        e.dispatch({ type: 'TEST/decrement', payload: { by: 2 } });
      });

      store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(events.length).to.eql(2);
      expect(events[0].type).to.eql('TEST/increment');
      expect(events[1].type).to.eql('TEST/decrement');
    });

    it('dispatches a follow-on event  (async)', async () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const events: t.IDispatch[] = [];
      store.events$.subscribe(e => events.push(e));

      store.on<IIncrementEvent>('TEST/increment').subscribe(async e => {
        await time.wait(3);
        e.dispatch({ type: 'TEST/decrement', payload: { by: 2 } });
      });

      expect(events.length).to.eql(0);
      store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(events.length).to.eql(1);

      await time.wait(10);
      expect(events.length).to.eql(2);
    });
  });

  describe('lens', () => {
    it('root lens', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const lens = store.lens<IMyModel>(() => store.state);
      expect(lens.state).to.eql(initial);
      expect(lens.state).to.not.equal(initial);
    });

    it('child lens', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const lens = store.lens<IMyFoo>(() => store.state.foo);
      expect(lens.state).to.eql(initial.foo);
      expect(lens.state).to.not.equal(initial.foo);
    });

    it('changes on dispatch', () => {
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const lens = store.lens<IMyFoo>(() => store.state.foo);
      store.on<IChangeFooEvent>('TEST/changeFoo').subscribe(e => {
        const state = e.state;
        const foo = { ...state.foo, msg: 'Hello' };
        e.change({ ...state, foo });
      });
      expect(lens.state.msg).to.eql(undefined);
      lens.dispatch({ type: 'TEST/changeFoo', payload: {} });
      expect(lens.state.msg).to.eql('Hello');
    });

    it('fires changed events', () => {
      const events: t.IStateChange[] = [];
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const lens = store.lens<IMyFoo>(() => store.state.foo);
      lens.changed$.subscribe(e => events.push(e));

      store.on<IChangeFooEvent>('TEST/changeFoo').subscribe(e => e.change(e.state));
      lens.dispatch({ type: 'TEST/changeFoo', payload: {} });
      lens.dispatch({ type: 'TEST/changeFoo', payload: {} });
      expect(events.length).to.eql(2);
    });

    it('stops firing events when root store is disposed', () => {
      const events: t.IStateChange[] = [];
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const lens = store.lens<IMyFoo>(() => store.state.foo);
      lens.changed$.subscribe(e => events.push(e));
      store.on<IChangeFooEvent>('TEST/changeFoo').subscribe(e => e.change(e.state));

      lens.dispatch({ type: 'TEST/changeFoo', payload: {} });
      expect(events.length).to.eql(1);

      store.dispose();
      lens.dispatch({ type: 'TEST/changeFoo', payload: {} });
      lens.dispatch({ type: 'TEST/changeFoo', payload: {} });
      expect(events.length).to.eql(1);
    });

    it('disposes of lens', () => {
      const rootEvents: t.IStateChange[] = [];
      const lensEvents: t.IStateChange[] = [];
      const store = Store.create<IMyModel, MyEvent>({ initial });
      const lens = store.lens<IMyFoo>(() => store.state.foo);

      store.changed$.subscribe(e => rootEvents.push(e));
      lens.changed$.subscribe(e => lensEvents.push(e));
      store.on<IChangeFooEvent>('TEST/changeFoo').subscribe(e => e.change(e.state));

      expect(store.isDisposed).to.eql(false);
      expect(lens.isDisposed).to.eql(false);

      lens.dispatch({ type: 'TEST/changeFoo', payload: {} });

      expect(rootEvents.length).to.eql(1);
      expect(lensEvents.length).to.eql(1);

      lens.dispose();

      expect(store.isDisposed).to.eql(false);
      expect(lens.isDisposed).to.eql(true);

      lens.dispatch({ type: 'TEST/changeFoo', payload: {} });

      expect(rootEvents.length).to.eql(2);
      expect(lensEvents.length).to.eql(1);
    });
  });
});
