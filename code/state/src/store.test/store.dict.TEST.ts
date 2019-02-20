import { expect } from 'chai';
import { createStore, StoreFactory, Reducer } from '..';
import { StoreInternal, StoreContext, StoreFactoryOptions, value } from '../common';

const ROOT_STATE: IRootState = { isLoaded: false };
const CHILD_STATE: IChildState = { total: 0, name: 'Unnamed' };

/**
 * TYPES: Root (Parent)
 */
interface IRootState {
  isLoaded: boolean;
  children?: { [key: string]: IChildState };
  foo?: { bar: { name?: string } };
}

type IRootActions = ILoadAction | IRemoveAction | ITestAction;
interface ILoadAction {
  type: 'ROOT/load';
  payload: {};
}
interface IRemoveAction {
  type: 'ROOT/remove';
  payload: { key: string };
}
interface ITestAction {
  type: 'ROOT/test';
  payload: { message: string };
}

/**
 * TYPES: Child
 */
interface IChildState {
  total: number;
  name: string;
}

type IChildAction = IChildActionOne | IChildActionTwo;
interface IChildActionOne {
  type: 'CHILD/one';
  payload: {
    name?: string;
  };
}
interface IChildActionTwo {
  type: 'CHILD/two';
  payload: {
    name?: string;
  };
}

const childReducer: Reducer<IChildState, IChildAction> = (s, a) => {
  return {
    ...s,
    total: s.total + 1,
    name: a.payload.name || 'Unnamed',
  };
};

type RootFactory = StoreFactory<IRootState, IRootActions>;
const rootFactory: RootFactory = (options = {}) => {
  const { initial = ROOT_STATE } = options;
  return createStore<IRootState, IRootActions>(initial);
};

type ChildFactory = StoreFactory<IChildState, IChildAction>;
const childFactory: ChildFactory = (options = {}) => {
  const { initial = CHILD_STATE } = options;
  const store = createStore<IChildState, IChildAction>(initial);
  store.reduce<IChildActionOne>('CHILD/one', childReducer);
  return store;
};

type Internal = StoreInternal<any, any>;

/**
 * TESTS
 */
describe('store (child dictionary)', () => {
  it('registers dictionary to the internal data collection (shallow path)', () => {
    const root = rootFactory() as Internal;

    const result = root.dict('children', childFactory);
    expect(result).to.equal(root);
    expect(root.data.childDictionaries.length).to.eql(1);

    const item = root.data.childDictionaries[0];
    expect(item.path).to.eql('children');
    expect(item.factory).to.eql(childFactory);
    expect(item.items).to.eql([]);
  });

  it('registers dictionary to the internal data collection (deep path)', () => {
    const root = rootFactory() as Internal;
    root.dict('foo.bar', childFactory);
    expect(root.state.foo).to.eql(undefined); // Not immediately created (lazy).

    const item = root.data.childDictionaries[0];
    expect(item.path).to.eql('foo.bar');

    root.get('foo.bar', { key: 'baz' });
    expect(root.state.foo.bar.baz.name).to.eql('Unnamed');
  });

  it('registers dictionary as persistent', () => {
    const initial: IRootState = { isLoaded: false, children: {} };
    const root = rootFactory({ initial }) as Internal;
    root.dict('children', childFactory);
    expect(root.data.childDictionaries[0].isPersistent).to.eql(true);
    expect(root.state.children).to.eql({});
  });

  it('registers dictionary as NOT persistent', () => {
    const root = rootFactory() as Internal;
    root.dict('children', childFactory);
    expect(root.data.childDictionaries[0].isPersistent).to.eql(false);
    expect(root.state.children).to.eql(undefined);
  });

  it('throws if a dictionary with the same key is added more than once', () => {
    const root = rootFactory();
    root.dict('children', childFactory);
    const fn = () => root.dict('children', childFactory);
    expect(fn).to.throw();
  });

  describe('get', () => {
    it('retrieves the dictionary store by key (shallow)', () => {
      type Internal = StoreInternal<any, any>;
      let createCount = 0;
      const factory: ChildFactory = () => {
        createCount++;
        return createStore(CHILD_STATE);
      };
      const root = rootFactory() as Internal;
      root.dict('children', factory);
      expect(root.data.key).to.eql(undefined);

      // First call (creates store).
      const result1 = root.get('children', { key: 'one' }) as Internal;
      expect(createCount).to.eql(1);
      expect(result1).to.not.equal(undefined);
      if (result1) {
        expect(result1.state).to.eql(CHILD_STATE);
        expect(result1.data.key).to.eql('children.one');
      }

      // Second call (retrieves already created store).
      const result2 = root.get('children', { key: 'one' });
      expect(createCount).to.eql(1);
      expect(result2).to.equal(result1);
    });

    it('retrieves the dictionary store by key (deep path)', () => {
      const root = rootFactory();
      root.dict('foo.bar', childFactory);
      const child = root.get('foo.bar', { key: 'one' }) as Internal;
      if (child) {
        child.reduce<IChildActionOne>('CHILD/one', (s, a) => {
          return { ...s, name: a.payload.name };
        });
      }

      root.dispatch<IChildActionOne>('CHILD/one', { name: 'Sarah' });
      expect((root.state as any).foo.bar.one.name).to.eql('Sarah');
      expect(child.state.name).to.eql('Sarah');

      child.dispatch<IChildActionOne>('CHILD/one', { name: 'Selina' });
      expect((root.state as any).foo.bar.one.name).to.eql('Selina');
      expect(child.state.name).to.eql('Selina');
    });

    it('retrieves the dictionary store by key (shallow path)', () => {
      type Internal = StoreInternal<any, any>;
      // const childFactory: ChildFactory = () => createStore(CHILD_STATE);
      const root = createStore(ROOT_STATE) as Internal;
      const child = childFactory() as Internal;
      child.dict('children', childFactory);

      expect(child.state.children).to.eql(undefined); // NB: Root object not created initially.

      root.add('child', child);

      const grandchild1 = child.get('children', { key: 'foo' }) as Internal;
      const grandchild2 = root.get('child.children', {
        key: 'foo',
      }) as Internal;

      expect(root.data.key).to.eql(undefined);
      expect(child.data.key).to.eql('child');

      expect(grandchild1.data.key).to.eql('child.children.foo');
      expect(grandchild2.data.key).to.eql('child.children.foo');

      const children = child.state.children;
      expect(children).to.not.eql(undefined); // NB: Children object has not been created after first `get` of the child store.
      if (children) {
        expect(children.foo.name).to.eql('Unnamed');
        expect(children.foo.total).to.eql(0);
      }
    });
  });

  it('passes initial state to factory', () => {
    let options: StoreFactoryOptions<IChildState> | undefined;
    const factory: ChildFactory = (o = {}) => {
      options = o;
      const { initial = CHILD_STATE } = o;
      const store = createStore<IChildState, IChildAction>(initial);
      return store;
    };

    const root = rootFactory() as Internal;
    root.dict('children', factory);

    root.get('children', {
      key: 'one',
      initialState: { foo: 123 },
    });

    expect(options).to.not.eql(undefined);
    if (options) {
      expect(options.initial).to.eql({ foo: 123 });
      expect(options.path).to.eql('children');
      expect(options.key).to.eql('one');
    }
  });

  it('does not find child dictionary (no matching entry)', () => {
    const root = rootFactory();
    root.dict('children', childFactory);
    const child = root.get('foo', { key: 'one' });
    expect(child).to.eql(undefined);
  });

  it('does not find a normal registered store from path when dictionary `key` is given to `get` method', () => {
    const root = rootFactory();
    const child = createStore<IChildState, IChildAction>(CHILD_STATE);
    root.add('foo', child);

    const result1 = root.get('foo', { key: 'one' });
    const result2 = root.get('foo');
    expect(result1).to.eql(undefined);
    expect(result2).to.equal(child);
  });

  it('constructs with initial state from parent', () => {
    const initial = {
      ...ROOT_STATE,
      children: { foo: { total: 123, name: 'Bob' } },
    };
    const root = createStore<IRootState, IRootActions>(initial);
    root.dict('children', childFactory);

    const child = root.get<IChildState, IChildAction>('children', {
      key: 'foo',
    });

    expect(child && child.state.total).to.eql(123);
    expect(child && child.state.name).to.eql('Bob');
  });

  it('changes state via dispatch called on dictionary child', () => {
    const root = rootFactory();
    root.dict('children', childFactory);

    const foo = root.get<IChildState, IChildAction>('children', { key: 'foo' });
    if (foo) {
      foo.dispatch<IChildActionOne>('CHILD/one', { name: 'MyFoo' });
    }
    expect(foo && foo.state.total).to.eql(1);
    expect(foo && foo.state.name).to.eql('MyFoo');

    const rootChildState = (root.state.children as any).foo as IChildState;
    expect(rootChildState.total).to.eql(1);
    expect(rootChildState.name).to.eql('MyFoo');
  });

  it('sets the parent context on the dictionary child', () => {
    const root = rootFactory();
    root.dict('children', childFactory);
    const foo = root.get<IChildState, IChildAction>('children', {
      key: 'foo',
    }) as StoreInternal<IChildState, IChildAction>;
    expect(foo.data.parent).to.eql(root);
  });

  it('changes state via dispatch called on root', () => {
    const childFactory: ChildFactory = (options = {}) => {
      const { initial = CHILD_STATE } = options;
      const childStore = createStore<IChildState, IChildAction>(initial);
      const grandchild = createStore<IChildState, IChildAction>(CHILD_STATE);
      childStore.add('grandchild', grandchild);

      childStore.reduce<IChildActionOne>('CHILD/one', childReducer);
      grandchild.reduce<IChildActionTwo>('CHILD/two', childReducer);

      return childStore;
    };

    const root = createStore<IRootState, IRootActions | IChildAction>(ROOT_STATE);
    root.dict('children', childFactory);

    const foo = root.get<IChildState, IChildAction>('children', { key: 'foo' });
    root.dispatch<IChildActionOne>('CHILD/one', { name: 'MyFoo' });

    expect(foo && foo.state.total).to.eql(1);
    expect(foo && foo.state.name).to.eql('MyFoo');

    const rootChildState = (root.state.children as any).foo as IChildState;
    expect(rootChildState.total).to.eql(1);
    expect(rootChildState.name).to.eql('MyFoo');

    let grandchildState = (rootChildState as any).grandchild;
    expect(grandchildState.total).to.eql(0);
    expect(grandchildState.name).to.eql('Unnamed');

    root.dispatch<IChildActionTwo>('CHILD/two', { name: 'MyGrandchild' });

    grandchildState = (root.state as any).children.foo.grandchild;
    expect(grandchildState.total).to.eql(1);
    expect(grandchildState.name).to.eql('MyGrandchild');
  });

  it('passes key in [StateContext] passed to reducer', () => {
    const context = { foo: 123 };
    const root = createStore<IRootState, IRootActions>(ROOT_STATE, {
      name: 'MyStore',
      context,
    });
    root.dict('children', childFactory);
    const child = root.get('children', { key: 'foo' });

    let options: StoreContext | undefined;
    if (child) {
      child.reduce<IChildActionTwo>('CHILD/two', (s, a, o) => (options = o));
      root.dispatch<IChildActionTwo>('CHILD/two', { name: 'yo' });
    }

    expect(options).not.to.eql(undefined);
    if (options) {
      expect(options.context).to.eql(context);
      expect(options.name).to.eql('MyStore');
      expect(options.key).to.eql('children.foo');
    }
  });

  it('creates dictionary-child and runs factory via state supplied from root reducer', () => {
    let childFactoryCount = 0;
    const childFactory: ChildFactory = (options = {}) => {
      childFactoryCount++;
      const { initial = CHILD_STATE } = options;
      return createStore<IChildState, IChildAction>(initial);
    };

    const initial = { ...ROOT_STATE, children: {} };
    const root = rootFactory({ initial });
    root.dict('children', childFactory);
    root.reduce<ILoadAction>('ROOT/load', (s, a) => {
      return {
        ...s,
        isLoaded: true,
        children: {
          0: { total: 0, name: 'My Zero' },
          foo: { total: 10, name: 'My Foo' },
        },
      };
    });

    root.dispatch<ILoadAction>('ROOT/load');
    const children = root.state.children as { [key: string]: IChildState };

    expect(children[0].name).to.eql('My Zero');
    expect(children.foo.name).to.eql('My Foo');
    expect(childFactoryCount).to.eql(2);
  });

  it('updates child state when parent reducer modifies it', () => {
    const initial = { ...ROOT_STATE, children: {} };
    const root = rootFactory({ initial });
    root.dict('children', childFactory);
    let total = 0;
    root.reduce<ILoadAction>('ROOT/load', (s, a) => {
      total++;
      return {
        ...s,
        isLoaded: true,
        children: {
          foo: { total, name: 'My Foo' },
        },
      };
    });

    type ChildDict = { [key: string]: IChildState };

    root.dispatch<ILoadAction>('ROOT/load');
    expect((root.state.children as ChildDict).foo.total).to.eql(1);

    root.dispatch<ILoadAction>('ROOT/load');
    expect((root.state.children as ChildDict).foo.total).to.eql(2);

    root.dispatch<ILoadAction>('ROOT/load');
    expect((root.state.children as ChildDict).foo.total).to.eql(3);
  });

  it('removes child state from root reducer update', () => {
    let rootCount = 0;
    type ChildDict = { [key: string]: IChildState };

    const initial = { ...ROOT_STATE, children: {} };
    const root = rootFactory({ initial });
    root.dict('children', childFactory);

    root.state$.subscribe(() => rootCount++);

    root.reduce<ILoadAction>('ROOT/load', (s, a) => {
      const obj = s.children || {};
      const key = Object.keys(obj as ChildDict).length;
      const children = {
        ...obj,
        [key]: { total: key, name: `Item-${key + 1}` },
      };
      return { ...s, isLoaded: true, children };
    });

    root.reduce<IRemoveAction>('ROOT/remove', (s, a) => {
      const children = { ...s.children };
      delete children[a.payload.key];
      return { ...s, children };
    });

    // First dispatch: add the child.
    let children: ChildDict;
    root.dispatch<ILoadAction>('ROOT/load');
    root.dispatch<ILoadAction>('ROOT/load');
    children = root.state.children as ChildDict;
    expect(Object.keys(children).length).to.eql(2);
    expect(rootCount).to.eql(2);

    // Add a reducer to the first child store.
    let childCount = 0;
    const childStore1 = root.get('children', { key: '0' });
    if (childStore1) {
      childStore1.reduce<IChildActionTwo>('CHILD/two', (s, a) => childCount++);
      root.dispatch<IChildActionTwo>('CHILD/two', { name: 'Foo' });
      expect(childCount).to.eql(1);
      expect(rootCount).to.eql(3);
    }

    // Second dispatch: remove first child (0) from dictionary.
    root.dispatch<IRemoveAction>('ROOT/remove', { key: '0' });
    children = root.state.children as ChildDict;
    expect(Object.keys(children).length).to.eql(1);
    expect(children['1'].name).to.eql('Item-2');
    expect(rootCount).to.eql(4);

    // Dispatch another child action from the root.
    // The removed child store's reducer should not respond.
    root.dispatch<IChildActionTwo>('CHILD/two', { name: 'Bar' });
    expect(childCount).to.eql(1); // No change.
    expect(rootCount).to.eql(4); // No change.
  });

  it('fires event from root as well as dictionary-child store', () => {
    const root = rootFactory();
    root.dict('children', childFactory);
    const child = root.get('children', { key: 'foo' }) as Internal;

    let rootCount = 0;
    root.state$.subscribe(e => rootCount++);

    let childCount = 0;
    child.state$.subscribe(e => childCount++);

    child.dispatch<IChildAction>('CHILD/one');
    expect(rootCount).to.eql(1);
    expect(childCount).to.eql(1);

    child.dispatch<IChildAction>('CHILD/one');
    expect(rootCount).to.eql(2);
    expect(childCount).to.eql(2);
  });

  describe('remove (store)', () => {
    describe('removes the parent container object (prune)', () => {
      it('via API', () => {
        const root = rootFactory() as Internal;
        root.dict('children', childFactory);
        expect(root.data.childDictionaries[0].isPersistent).to.eql(false);

        const child = root.get('children', { key: 'foo' }) as Internal;

        expect(root.data.childDictionaries.length).to.eql(1);
        expect(root.data.childDictionaries[0].path).to.eql('children');
        expect(root.state.children && root.state.children.foo.total).to.eql(0);
        expect(child.state.total).to.eql(0);

        root.remove('children', { key: 'foo' });

        expect(root.state.children).to.eql(undefined); // NB: Item removed
        expect(root.data.childDictionaries.length).to.eql(1);
      });

      it('via reducer', () => {
        const root = rootFactory() as Internal;
        root.dict('children', childFactory);
        expect(root.data.childDictionaries[0].isPersistent).to.eql(false);

        expect(root.state.children).to.eql(undefined);
        root.get('children', { key: 'foo' });
        expect(root.state.children.foo.total).to.eql(0);

        root.reduce<IRemoveAction>('ROOT/remove', (s, a) => {
          const key = a.payload.key;
          root.remove('children', { key });
          s = value.object.prune(`children.${key}.*`, s);
          return s;
        });

        root.dispatch<IRemoveAction>('ROOT/remove', { key: 'foo' });
        expect(root.state.children).to.eql(undefined);
      });
    });

    describe('retains the parent container object', () => {
      it('dictionary object is persistent within the state tree (via reducer)', () => {
        const initial = { ...ROOT_STATE, children: {} };
        const root = rootFactory({ initial }) as Internal;
        root.dict('children', childFactory);
        expect(root.data.childDictionaries[0].isPersistent).to.eql(true);

        expect(root.state.children).to.eql({});
        root.get('children', { key: 'foo' });
        expect(root.state.children.foo.total).to.eql(0);

        root.reduce<IRemoveAction>('ROOT/remove', (s, a) => {
          const { key } = a.payload;
          const children = { ...s.children } || {};
          delete children[key];
          return { ...s, children };
        });

        root.dispatch<IRemoveAction>('ROOT/remove', { key: 'foo' });
        expect(root.state.children).to.eql({});
      });

      it('not the last child', () => {
        const root = rootFactory() as Internal;
        root.dict('children', childFactory);
        root.get('children', { key: 'one' });
        root.get('children', { key: 'two' });

        expect(root.data.childDictionaries.length).to.eql(1);
        expect(root.data.childDictionaries[0].items.length).to.eql(2);

        let children: any;
        children = root.state.children;
        expect(children.one.total).to.eql(0);
        expect(children.two.total).to.eql(0);
        expect(children.three).to.eql(undefined);

        root.remove('children', { key: 'one' });

        expect(root.data.childDictionaries.length).to.eql(1); // Dictionary definition remains.
        expect(root.data.childDictionaries[0].items.length).to.eql(1);

        children = root.state.children;
        expect(children.one).to.eql(undefined);
        expect(children.two.total).to.eql(0);
      });
    });
  });
});
