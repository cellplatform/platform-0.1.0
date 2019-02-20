import { expect } from 'chai';
import { createStore, StateChange } from '..';

/**
 * TYPES
 */
interface IMyState {
  isLoaded: boolean;
  count: number;
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

/**
 * TESTS
 */
describe('store', () => {
  it('has specified initial state', () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE);
    expect(app.state).to.eql({ isLoaded: false, count: 0 });
  });

  it('dispatches actions to all reducers', () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE);
    let incomingAction: IMyActions | undefined;
    let incomingState: IMyState | undefined;
    app.reducer((s, a) => {
      incomingAction = a;
      incomingState = s;
      switch (a.type) {
        case 'ROOT/load':
          return { ...s, isLoaded: true };
        default:
          return undefined;
      }
    });
    app.dispatch<ILoadAction>('ROOT/load');
    expect(incomingAction).to.eql({ type: 'ROOT/load', payload: {} });
    expect(incomingState).to.eql({ isLoaded: false, count: 0 });
  });

  it('dispatches action to only specified reducers or generic reducers', () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE);
    const genericActions: string[] = [];
    const specificActions: string[] = [];

    app.reducer<ILoadAction>((s, a) => {
      genericActions.push(a.type);
    });

    app.reduce<ILoadAction>('ROOT/load', (s, a) => {
      specificActions.push(a.type);
      return { ...s, isLoaded: true };
    });

    app.dispatch<ILoadAction>('ROOT/load');
    app.dispatch<ILoadedAction>('ROOT/loaded');

    expect(genericActions).to.eql(['ROOT/load', 'ROOT/loaded']);
    expect(specificActions).to.eql(['ROOT/load']);
  });

  it('exposes context from the created store', () => {
    const context = { foo: 123, getThing: () => true };
    const store = createStore<IMyState, IMyActions>(DEFAULT_STATE, { context });
    expect(store.context).to.eql(context);
  });

  it('exposes context (via factory function)', () => {
    let count = 0;
    const context = () => {
      count++;
      return { foo: 123 };
    };
    const store = createStore<IMyState, IMyActions>(DEFAULT_STATE, { context });
    expect(count).to.eql(0);
    expect(store.context).to.eql({ foo: 123 });
    expect(count).to.eql(1);

    expect(store.context).to.eql({ foo: 123 });
    expect(store.context).to.eql({ foo: 123 });
    expect(count).to.eql(1); // NB: Does not re-create context.
  });

  it('passes context options to reducers', () => {
    const context = { foo: 123 };
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE, { context });
    const list: any[] = [];
    app.reducer<ILoadAction>((s, a, o) => {
      list.push(o);
    });
    app.reduce<ILoadAction>('ROOT/load', (s, a, o) => {
      list.push(o);
    });

    app.dispatch<ILoadAction>('ROOT/load');

    expect(list.length).to.eql(2);
    expect(list[0].context).to.equal(context);
    expect(list[1].context).to.equal(context);
  });

  it('passes state to reducer', () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE);
    const list: any[] = [];
    app.reducer<ILoadAction>((s, a) => {
      list.push(s);
    });
    app.dispatch<ILoadAction>('ROOT/load');
    expect(list[0]).to.eql(DEFAULT_STATE);
  });

  it('fires new state from observable', () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE);
    app.reduce('ROOT/load', (s, a) => ({ ...s, isLoaded: true }));

    const events: Array<StateChange<IMyState, IMyActions>> = [];
    app.state$.subscribe(s => events.push(s));

    app.dispatch<ILoadAction>('ROOT/load');

    expect(events.length).to.eql(1);
    expect(events[0].type).to.eql('ROOT/load');
    expect(events[0].type).to.eql(events[0].action.type);
    expect(events[0].payload).to.eql(events[0].action.payload);
    expect(events[0].state.isLoaded).to.eql(true);
    expect(app.state).to.eql(events[0].state);
  });

  it('does not fire change if no matching reducer is run', () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE);

    let reducerCount = 0;
    app.reduce('ROOT/loaded', (s, a) => {
      reducerCount++;
      return { ...s, isLoaded: true };
    });

    const events: Array<StateChange<IMyState, IMyActions>> = [];
    app.state$.subscribe(s => events.push(s));

    app.dispatch<ILoadAction>('ROOT/load');

    expect(app.state).to.eql(DEFAULT_STATE);
    expect(reducerCount).to.eql(0);
    expect(events.length).to.eql(0);
  });

  it('does not require state to be returned from a reducer', () => {
    const app = createStore<IMyState, IMyActions>(DEFAULT_STATE);
    app.reduce('ROOT/load', (s, a) => undefined);

    const events: Array<StateChange<IMyState, IMyActions>> = [];
    app.state$.subscribe(s => events.push(s));

    const initialState = app.state;
    app.dispatch<ILoadAction>('ROOT/load');

    expect(events[0].state).to.eql(app.state);
    expect(events[0].state).to.eql(initialState);
    expect(events[0].state).not.to.equal(initialState);
  });
});
