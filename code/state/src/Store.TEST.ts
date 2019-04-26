import { time } from '@platform/util.value';
import { expect } from 'chai';

import { Store } from '.';
import * as t from './types';

export type IMyModel = {
  count: number;
};

type MyEvent = IIncrementEvent | IDecrementEvent;
type IIncrementEvent = {
  type: 'TEST/increment';
  payload: { by: number };
};
type IDecrementEvent = {
  type: 'TEST/decrement';
  payload: { by: number };
};

const initial: IMyModel = { count: 0 };

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
      expect(states[0]).to.equal(states[1]); // NB: The same copy is returned from repeat calls to 'state' property.
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

      expect(change1.event.type).to.eql('TEST/increment');
      expect(change1.event.payload.by).to.eql(90);

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
});
