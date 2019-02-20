import { expect } from 'chai';
import { createStore, StateChange } from '..';
import { time, StoreContext } from '../common';

interface IMyState {
  isLoaded: boolean;
  count: number;
  children?: { [key: string]: IChildState };
}
const DEFAULT_STATE = { isLoaded: false, count: 0 };

type IMyActions = ILoadAction | ILoadedAction | IIncrementAction;
interface ILoadAction {
  type: 'ROOT/load';
  payload: {};
}

interface ILoadedAction {
  type: 'ROOT/loaded';
  payload: {};
}

interface IIncrementAction {
  type: 'ROOT/increment';
  payload: { by: number };
}

interface IChildState {
  name?: string;
}

/**
 * TESTS
 */
describe('store.on (epic)', () => {
  it('listens for action (sync)', () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE)
      .reduce('ROOT/load', (s, a) => ({ ...s, isLoaded: true }))
      .reduce<IIncrementAction>('ROOT/increment', (s, a) => ({
        ...s,
        count: s.count += a.payload.by,
      }));

    const eventStates: Array<StateChange<IMyState, IMyActions>> = [];
    app.state$.subscribe(s => eventStates.push(s));

    const epicStates: IMyState[] = [];
    app.on<ILoadAction>('ROOT/load').subscribe(e => {
      epicStates.push(e.state);

      // Fire another action in response to the 'Load' action.
      e.dispatch<IIncrementAction>('ROOT/increment', { by: 2 });
    });

    app.on<IIncrementAction>('ROOT/increment').subscribe(e => {
      epicStates.push(e.state);
    });

    app.dispatch<ILoadAction>('ROOT/load');

    expect(eventStates.length).to.eql(2);
    expect(eventStates[0].state.count).to.eql(0);
    expect(eventStates[1].state.count).to.eql(2);

    expect(epicStates.length).to.eql(2);
    expect(epicStates[0].count).to.eql(0);
    expect(epicStates[1].count).to.eql(2); // The state the epic encounters is after reducers have run.
  });

  it('listens for action (async)', async () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE)
      .reduce('ROOT/load', (s, a) => ({ ...s, isLoaded: true }))
      .reduce<IIncrementAction>('ROOT/increment', (s, a) => ({
        ...s,
        count: s.count += a.payload.by,
      }));

    const events: Array<StateChange<IMyState, IMyActions>> = [];
    app.state$.subscribe(s => events.push(s));

    app.on<ILoadAction>('ROOT/load').subscribe(e => {
      // Simulate delay.
      time.delay(0, () => {
        e.dispatch<IIncrementAction>('ROOT/increment', { by: 2 });
      });
    });

    app.dispatch<ILoadAction>('ROOT/load');

    // Initial state - async epic has not completed yet.
    expect(events.length).to.eql(1);

    // After delayed epic completes.
    await time.delay(20, () => true);
    expect(events.length).to.eql(2);
    expect(events[0].state.count).to.eql(0);
    expect(events[1].state.count).to.eql(2);
  });

  it('passes [StateContext] to the `on` handler and `state$` events', () => {
    const context = { foo: 123, fn: () => true };
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE, {
      context,
      name: 'MyStore',
    })
      .reduce('ROOT/load', (s, a) => ({ ...s, isLoaded: true }))
      .reduce('ROOT/loaded', (s, a) => s);

    let epicOptions: StoreContext | undefined;
    app.on<ILoadAction>('ROOT/load').subscribe(e => (epicOptions = e.options));

    let stateOptions: StoreContext | undefined;
    app.state$.subscribe(e => (stateOptions = e.options));

    app.dispatch<ILoadAction>('ROOT/load');

    expect(epicOptions).to.not.eql(undefined);
    expect(stateOptions).to.not.eql(undefined);
    expect(stateOptions).to.eql(epicOptions);

    if (epicOptions) {
      expect(epicOptions.context).to.equal(context);
      expect(epicOptions.context.fn).to.be.an.instanceof(Function);
      expect(epicOptions.name).to.equal('MyStore');
      expect(epicOptions.key).to.eql(undefined);
    }
  });
});
