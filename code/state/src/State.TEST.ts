import { time } from '@platform/util.value';
import { expect } from 'chai';

import { State } from '.';
import * as t from './types';

type TestEvent = IIncrementEvent | IDecrementEvent;

type IIncrementEvent = {
  type: 'TEST/increment';
  payload: { by: number };
};

type IDecrementEvent = {
  type: 'TEST/decrement';
  payload: { by: number };
};

export type ITestModel = {
  count: number;
};

const initial: ITestModel = { count: 0 };

describe('State', () => {
  describe('lifecycle', () => {
    it('constructs', () => {
      const state = State.create<ITestModel, TestEvent>({ initial });
      expect(state.isDisposed).to.eql(false);
      expect(state.current).to.not.equal(initial);
      expect(state.current).to.eql(initial);
    });

    it('disposes', () => {
      const state = State.create<ITestModel, TestEvent>({ initial });

      let count = 0;
      state.dispose$.subscribe(() => count++);

      state.dispose();
      state.dispose();
      expect(state.isDisposed).to.eql(true);
      expect(count).to.eql(1);
    });
  });

  describe('dispatch', () => {
    it('returns the state object', () => {
      const state = State.create<ITestModel, TestEvent>({ initial });
      const res = state.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(res).to.equal(res);
    });

    it('fires dispatch event', () => {
      const state = State.create<ITestModel, TestEvent>({ initial });
      const events: t.IDispatch[] = [];
      state.events$.subscribe(e => events.push(e));

      state.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      state.dispatch({ type: 'TEST/decrement', payload: { by: 2 } });

      expect(events.length).to.eql(2);
      expect(events[0].type).to.eql('TEST/increment');
      expect(events[1].type).to.eql('TEST/decrement');
    });

    it('returns copy of current object on event', () => {
      const state = State.create<ITestModel, TestEvent>({ initial });

      const models: ITestModel[] = [];
      state.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        models.push(e.current);
        models.push(e.current);
      });

      state.dispatch({ type: 'TEST/increment', payload: { by: 1 } });

      expect(models.length).to.eql(2);
      expect(models[0]).to.eql(state.current); // NB: Equivalent.
      expect(models[1]).to.eql(state.current); // NB: Equivalent.

      // Not the same instance.
      expect(models[0]).to.not.equal(state.current);
      expect(models[1]).to.not.equal(state.current);
      expect(models[0]).to.equal(models[1]); // NB: The same copy is returned from repeat calls to 'current' property.
    });

    it('changes current state', () => {
      const state = State.create<ITestModel, TestEvent>({ initial });
      expect(state.current.count).to.eql(0);

      state.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        const count = e.current.count + e.payload.by;
        const next = { ...e.current, count };
        e.change(next);
      });

      state.on<IDecrementEvent>('TEST/decrement').subscribe(e => {
        const count = e.current.count - e.payload.by;
        const next = { ...e.current, count };
        e.change(next);
      });

      state.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(state.current.count).to.eql(1);

      state.dispatch({ type: 'TEST/decrement', payload: { by: 2 } });
      expect(state.current.count).to.eql(-1);
    });

    it('fires [changed] event', () => {
      const state = State.create<ITestModel, TestEvent>({ initial });
      const events: Array<t.IStateChange<any, any>> = [];
      state.changed$.subscribe(e => events.push(e));

      state.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        if (e.payload.by > 0) {
          const count = e.current.count + e.payload.by;
          const next = { ...e.current, count };
          e.change(next);
        }
      });

      state.dispatch({ type: 'TEST/increment', payload: { by: 90 } });
      state.dispatch({ type: 'TEST/increment', payload: { by: 0 } }); // No change.
      state.dispatch({ type: 'TEST/increment', payload: { by: 2 } });

      expect(events.length).to.eql(2);

      const change1: t.IStateChange<ITestModel, IIncrementEvent> = events[0];
      const change2: t.IStateChange<ITestModel, IIncrementEvent> = events[1];

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
      const state = State.create<ITestModel, TestEvent>({ initial });
      const events: t.IDispatch[] = [];
      state.events$.subscribe(e => events.push(e));

      state.on<IIncrementEvent>('TEST/increment').subscribe(e => {
        e.dispatch({ type: 'TEST/decrement', payload: { by: 2 } });
      });

      state.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(events.length).to.eql(2);
      expect(events[0].type).to.eql('TEST/increment');
      expect(events[1].type).to.eql('TEST/decrement');
    });

    it('dispatches a follow-on event  (async)', async () => {
      const state = State.create<ITestModel, TestEvent>({ initial });
      const events: t.IDispatch[] = [];
      state.events$.subscribe(e => events.push(e));

      state.on<IIncrementEvent>('TEST/increment').subscribe(async e => {
        await time.wait(3);
        e.dispatch({ type: 'TEST/decrement', payload: { by: 2 } });
      });

      expect(events.length).to.eql(0);
      state.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
      expect(events.length).to.eql(1);

      await time.wait(10);
      expect(events.length).to.eql(2);
    });
  });
});
