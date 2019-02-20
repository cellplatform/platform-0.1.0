import { expect } from 'chai';
import * as sinon from 'sinon';
import { createStore, IState, IAction } from '..';
import { StoreInternal, StoreContext } from '../common';

const CHILD_STATE: IChildState = { total: 0, name: 'Unnamed' };
const ROOT_STATE: IRootState = {
  isLoaded: false,
  count: 0,
  child: CHILD_STATE,
};

/**
 * TYPES: Root (Parent)
 */
interface IRootState {
  isLoaded: boolean;
  count: number;
  child: IChildState;
  foo?: { bar: { baz: IChildState } };
}

type IRootActions = ILoadAction | ILoadedAction | IIncrementAction;
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
 * TYPES: Child
 */
interface IChildState {
  total: number;
  name?: string;
}

type IChildActions = IChildActionOne | IChildActionTwo;
interface IChildActionOne {
  type: 'CHILD/one';
  payload: { name?: string };
}
interface IChildActionTwo {
  type: 'CHILD/two';
  payload: {};
}

type Internal = StoreInternal<any, any>;
const rootFactory = () => createStore<IRootState, IRootActions>(ROOT_STATE);
const childFactory = () => createStore<IChildState, IChildActions>(CHILD_STATE);

/**
 * TESTS
 */
describe('store (children)', () => {
  describe('add', () => {
    it('returns the root store (used for chaining)', () => {
      const root = rootFactory();
      const child = childFactory();
      const result = root.add('child', child);
      expect(result).to.eql(root);
    });

    it('adds a child store (shallow path)', () => {
      const root = rootFactory() as Internal;
      const child = childFactory();

      const result = root.add('myChild', child);
      expect(result).to.equal(root);

      const children = root.data.children;
      expect(children.length).to.eql(1);
      expect(children[0].path).to.equal('myChild');
      expect(children[0].store).to.equal(child);
      expect((children[0].store as Internal).data.key).to.equal('myChild');

      // Ensure key is returned on a retrieved child (via [.get]).
      const getChild = root.get('myChild') as Internal;
      expect(getChild.data.key).to.eql('myChild');
    });

    it('adds a child store (deep path)', () => {
      const root = rootFactory() as Internal;
      const child = childFactory();
      root.add('foo.bar.baz', child);

      expect(root.state.foo.bar.baz.name).to.eql('Unnamed');

      const children = root.data.children;
      expect(children.length).to.eql(1);
      expect(children[0].path).to.equal('foo.bar.baz');
      expect(children[0].store).to.equal(child);
      expect((children[0].store as Internal).data.key).to.equal('foo.bar.baz');

      // Ensure key is returned on a retrieved child (via [.get]).
      const getChild = root.get('foo.bar.baz') as Internal;
      expect(getChild.data.key).to.eql('foo.bar.baz');
    });

    it('throws if a child store is added with an existing key', () => {
      const root = rootFactory();
      const child1 = createStore<IChildState, IChildActions>(CHILD_STATE);
      const child2 = createStore<IChildState, IChildActions>(CHILD_STATE);
      root.add('myChild', child1);

      const fn = () => root.add('myChild', child2);
      expect(fn).to.throw(/A child store with key-path 'myChild' has already been added\./);
    });

    it('retrieves a child by key name (get)', () => {
      type Internal = StoreInternal<any, any>;
      const stores = {
        root: createStore<IRootState, IRootActions>(ROOT_STATE),
        child: createStore<IChildState, IChildActions>(CHILD_STATE),
        grandchild: createStore<IChildState, IChildActions>(CHILD_STATE),
      };

      stores.root.add('child', stores.child);
      stores.child.add('grandchild', stores.grandchild);

      const root = stores.root as Internal;
      const child = stores.root.get('child') as Internal;
      const grandchild = stores.root.get('child.grandchild') as Internal;

      expect(child).to.equal(stores.child);
      expect(grandchild).to.equal(stores.grandchild);

      expect(root.data.key).to.eql(undefined);
      expect(child.data.key).to.eql('child');
      expect(grandchild.data.key).to.eql('child.grandchild');
    });

    it('does not find child (no matching entry)', () => {
      const root = rootFactory();
      const child = childFactory();
      const grandchild = createStore<IChildState, IChildActions>(CHILD_STATE);
      root.add('child', child);
      child.add('grandchild', grandchild);
      expect(root.get('foo')).to.eql(undefined);
      expect(root.get('root.bar')).to.eql(undefined);
      expect(root.get('root.child.baz')).to.eql(undefined);
    });

    it('retrieves the root state if an empty string is passed', () => {
      const root = rootFactory();
      expect(root.get('')).to.equal(root);
      expect(root.get()).to.equal(root);
    });

    it('puts the child state on the root', () => {
      const root = createStore<
        IRootState & { child: IChildState & { grandchild: IChildState } },
        IRootActions
      >(ROOT_STATE as any);
      const child = childFactory();
      const grandchild = createStore<IChildState, IChildActions>(CHILD_STATE);
      root.add('child', child);
      child.add('grandchild', grandchild);
      expect(root.state.child.grandchild).to.eql(CHILD_STATE);
      expect(root.state.child).to.eql({
        ...CHILD_STATE,
        grandchild: CHILD_STATE,
      });
      expect(root.state).to.eql({
        ...ROOT_STATE,
        child: { ...CHILD_STATE, grandchild: CHILD_STATE },
      });
    });

    it('passes all dispatch calls through the root store', () => {
      const root = rootFactory();
      const child = childFactory();
      const grandchild = createStore<IChildState, IChildActions>(CHILD_STATE);
      root.add('myChild', child);
      child.add('myGrandchild', grandchild);

      const rootDispatch = sinon.spy();
      root.dispatch = rootDispatch;

      grandchild.dispatch<IChildActionOne>('CHILD/one');
      expect(rootDispatch.callCount).to.eql(1);
    });

    it('runs all reducers (top down)', () => {
      const list: Array<{ name: string; state: IState; action: IAction }> = [];

      const root = createStore<IRootState, IRootActions>(ROOT_STATE).reducer((state, action) => {
        list.push({ name: 'ROOT', state, action });
      });
      const child1 = createStore<IChildState, IChildActions>(CHILD_STATE).reducer(
        (state, action) => {
          list.push({ name: 'CHILD_1', state, action });
        },
      );
      const child2 = createStore<IChildState, IChildActions>(CHILD_STATE).reducer(
        (state, action) => {
          list.push({ name: 'CHILD_2', state, action });
        },
      );
      const grandchild = createStore<IChildState, IChildActions>(CHILD_STATE).reducer(
        (state, action) => {
          list.push({ name: 'GRAND_CHILD', state, action });
        },
      );

      root.add('child1', child1);
      root.add('child2', child2);
      child1.add('grandchild', grandchild);
      child1.dispatch<IChildActionOne>('CHILD/one');

      expect(list.length).to.eql(4);
      expect(list.map(item => item.name)).to.eql(['ROOT', 'CHILD_1', 'GRAND_CHILD', 'CHILD_2']);
    });

    it('passes parent changes to child state to child reducer', () => {
      const list: Array<{ name: string; state: IState; action: IAction }> = [];

      const root = createStore<IRootState, IRootActions>(ROOT_STATE).reducer((state, action) => {
        list.push({ name: 'ROOT', state, action });
        return { ...state, child: { ...state.child, name: 'Hello Child' } };
      });
      const child = createStore<IChildState, IChildActions>(CHILD_STATE).reducer(
        (state, action) => {
          list.push({ name: 'CHILD_1', state, action });
          return { ...state, total: state.total + 1 };
        },
      );
      root.add('child', child);
      root.dispatch<ILoadAction>('ROOT/load');

      expect(list[0].state).to.eql({
        ...ROOT_STATE,
        child: CHILD_STATE,
      });
      expect(list[1].state).to.eql({ total: 0, name: 'Hello Child' });

      expect(root.state.child.total).to.eql(1);
      expect(root.state.child.name).to.eql('Hello Child');
      expect(child.state.total).to.eql(1);
      expect(child.state.name).to.eql('Hello Child');
    });

    it('passes level specific state to child subscriber', () => {
      const root = rootFactory();
      const child = childFactory();

      root.reducer((state, action) => state);
      child.reducer((state, action) => state);

      let rootCount = 0;
      let rootState: IRootState | undefined;
      root.state$.subscribe(e => {
        rootCount++;
        return (rootState = e.state);
      });

      let childCount = 0;
      let childState: IChildState | undefined;
      child.state$.subscribe(e => {
        childCount++;
        return (childState = e.state);
      });

      root.add('child', child);
      child.dispatch<IChildActionOne>('CHILD/one');

      expect(rootCount).to.eql(1);
      expect(rootState).to.eql({ ...ROOT_STATE, child: CHILD_STATE });

      expect(childCount).to.eql(1);
      expect(childState).to.eql(CHILD_STATE);
    });

    it('updates a child with a deep path', () => {
      const root = rootFactory() as Internal;
      const child = childFactory();
      root.add('foo.bar.baz', child);

      child.reduce<IChildActionOne>('CHILD/one', (s, a) => ({
        ...s,
        name: a.payload.name,
      }));

      expect(root.state.foo.bar.baz.name).to.eql('Unnamed');
      root.dispatch<IChildActionOne>('CHILD/one', { name: 'Sarah' });
      expect(root.state.foo.bar.baz.name).to.eql('Sarah');
      expect(child.state.name).to.eql('Sarah');

      child.dispatch<IChildActionOne>('CHILD/one', { name: 'Selina' });
      expect(root.state.foo.bar.baz.name).to.eql('Selina');
      expect(child.state.name).to.eql('Selina');
    });

    it('passes key in [StateContext] passed to reducer', () => {
      const root = rootFactory();
      const child = childFactory();

      let options: StoreContext | undefined;
      child.reduce<IChildActionTwo>('CHILD/two', (s, a, o) => {
        options = o;
      });

      root.add('myKey', child);
      child.dispatch<IChildActionTwo>('CHILD/two');
      expect(options && options.key).to.eql('myKey');
    });

    it('fires root event when childer reducer has run', () => {
      const root = rootFactory();
      const child = childFactory();
      const grandchild = createStore<IChildState, IChildActions>(CHILD_STATE);

      let rootReducer = 0;
      let childReducer = 0;
      let grandchildReducer = 0;

      root.reduce<ILoadAction>('ROOT/load', (s, a) => {
        rootReducer++;
      });
      child.reduce<IChildActionOne>('CHILD/one', (s, a) => {
        childReducer++;
      });
      grandchild
        .reduce<IChildActionTwo>('CHILD/two', (s, a) => {
          grandchildReducer++;
        })
        .reducer((s, a) => s);

      child.add('grandchild', grandchild);
      root.add('child', child);

      let rootCount = 0;
      root.state$.subscribe(e => rootCount++);

      let childCount = 0;
      child.state$.subscribe(e => childCount++);

      let grandchildCount = 0;
      grandchild.state$.subscribe(e => grandchildCount++);

      // Fire reducer from bottom level.
      //    No other reducers will fire, but the observable events
      //    will be fired because there is a change to the child state.
      child.dispatch<IChildActionTwo>('CHILD/two');

      expect(rootCount).to.eql(1);
      expect(childCount).to.eql(1);
      expect(grandchildCount).to.eql(1);

      expect(rootReducer).to.eql(0);
      expect(childReducer).to.eql(0);
      expect(grandchildReducer).to.eql(1);
    });

    it('fires event from child as well as root', () => {
      const root = createStore<IRootState, IRootActions | IChildActions>(ROOT_STATE);
      const child = childFactory();
      root.add('child', child);

      child.reduce<IChildActionOne>('CHILD/one', (s, a) => {
        return { ...s, total: s.total + 1 };
      });

      let rootCount = 0;
      root.state$.subscribe(e => rootCount++);

      let childCount = 0;
      child.state$.subscribe(e => childCount++);

      child.dispatch<IChildActionOne>('CHILD/one');
      expect(rootCount).to.eql(1);
      expect(childCount).to.eql(1);

      root.dispatch<IChildActionOne>('CHILD/one');
      expect(rootCount).to.eql(2);
      expect(childCount).to.eql(2);
    });

    it('does not destroy the parent level data when only the child level changes', () => {
      const root = rootFactory();
      const child = childFactory();
      root.add('child', child);

      // NB: No matching reducer for the root.
      //     Ensure the root state is returned.
      child.reduce<IChildActionOne>('CHILD/one', (s, a) => ({
        ...s,
        total: s.total + 1,
      }));

      expect((root.state as any).child.total).to.eql(0);
      expect(child.state.total).to.eql(0);

      child.dispatch<IChildActionOne>('CHILD/one');

      expect((root.state as any).child.total).to.eql(1);
      expect(child.state.total).to.eql(1);

      // Root state values should still exist.
      expect(root.state.isLoaded).to.eql(false);
      expect(root.state.count).to.eql(0);
    });
  });

  describe('remove (store)', () => {
    it('returns the root store (chaining)', () => {
      const root = rootFactory();
      const child = childFactory();
      root.add('child', child);
      const result = root.remove('no-a-child');
      expect(result).to.eql(root);
    });

    it('does nothing when no child key is matched', () => {
      const root = rootFactory();
      const child = childFactory();
      root.add('child', child);

      const api = root as StoreInternal<IRootState, IRootActions>;
      expect(api.data.children.length).to.eql(1);
      root.remove('NOT_A_CHILD_KEY');
      expect(api.data.children.length).to.eql(1);
    });

    it('removes the child store from the parent', () => {
      const root = rootFactory();
      const child1 = createStore<IChildState, IChildActions>(CHILD_STATE);
      const child2 = createStore<IChildState, IChildActions>(CHILD_STATE);
      root.add('child1', child1);
      root.add('child2', child2);

      const api = root as StoreInternal<IRootState, IRootActions>;
      expect(api.data.children.length).to.eql(2);

      root.remove('child1');
      expect(api.data.children.length).to.eql(1);
      expect(api.data.children[0].path).to.eql('child2');
    });

    it('stops reacting to state changes', () => {
      let count = 0;
      let list: Array<{ name: string; state: IState; action: IAction }> = [];
      const root = createStore<IRootState, IRootActions>(ROOT_STATE).reducer((state, action) => {
        list.push({ name: 'ROOT', state, action });
        return state;
      });
      const child = createStore<IChildState, IChildActions>(CHILD_STATE).reducer(
        (state, action) => {
          list.push({ name: 'CHILD', state, action });
          return state;
        },
      );

      root.state$.subscribe(e => count++);

      root.add('child', child);
      root.dispatch<IChildActionOne>('CHILD/one');
      expect(count).to.eql(1);
      expect(list.length).to.eql(2);
      expect(list[0].name).to.eql('ROOT');
      expect(list[1].name).to.eql('CHILD');
      list = [];

      root.remove('child');
      root.dispatch<IChildActionOne>('CHILD/one');
      expect(count).to.eql(2);
      expect(list.length).to.eql(1);
      expect(list[0].name).to.eql('ROOT');
    });
  });
});
