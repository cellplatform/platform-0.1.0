import { expect, t } from '../test';
import { Builder } from '.';
import { StateObject } from '@platform/state';
import * as jpath from 'jsonpath';

/**
 * Data model types (State).
 */
type IModel = {
  name: string;
  childObject?: IModelChild;
  foo: { list: IModelItem[]; map: Record<string, IModelItem> };
};
type IModelChild = { count: number };
type IModelItem = { name: string; child: IModelItemChild; children: IModelItemChild[] };
type IModelItemChild = { count: number };

/**
 * Builder types.
 */
type IFoo = {
  name(value: string): IFoo;
  bar: IBar;
  listByIndex: t.BuilderListByIndex<IItem>;
  listByName: t.BuilderListByName<IItem>;
  map: t.BuilderMap<IItem, 'foo' | 'bar'>;
};

type IBar = {
  count(value: number): IBar;
  baz: IBaz;
  end: () => IFoo;
};

type IBaz = {
  increment: () => IBaz;
  parent: () => IBar; // NB: "end" is not a convention, maybe we want to use "parent" instead.
};

type IItem = {
  name(value: string): IItem;
  childField: IItemChild;
  childByIndex: t.BuilderListByIndex<IItemChild>;
  parent(): IFoo;
};

type IItemChild = {
  length(value: number): IItemChild;
  parent(): IItem;
};

/**
 * Handlers
 */
const fooHandlers: t.BuilderMethods<IModel, IFoo> = {
  name(args) {
    args.model.change((draft) => (draft.name = args.params[0]));
  },
  bar: {
    kind: 'object',
    path: '$.childObject',
    handlers: () => barHandlers,
  },
  listByIndex: {
    kind: 'list:byIndex',
    path: '$.foo.list',
    handlers: () => itemHandlers,
    default: (args) => ({ name: 'hello', child: { count: 0 }, children: [] }),
  },
  listByName: {
    kind: 'list:byName',
    path: '$.foo.list',
    handlers: () => itemHandlers,
    default: (args) => ({ name: 'hello', child: { count: 0 }, children: [] }),
  },
  map: {
    kind: 'map',
    path: '$.foo.map',
    handlers: () => itemHandlers,
    default: (args) => ({ name: 'hello', child: { count: 0 }, children: [] }),
  },
};

const barHandlers: t.BuilderMethods<IModel, IBar> = {
  count(args) {
    args.model.change((draft) => {
      type T = NonNullable<IModel['childObject']>;

      if (!jpath.query(draft, args.path)[0]) {
        draft.childObject = { count: args.params[0] };
      }

      jpath.apply(draft, args.path, (value: T) => {
        value.count = args.params[0];
        return value;
      });
    });
  },

  baz: {
    kind: 'object',
    path: '$.childObject',
    handlers: () => bazHandlers,
  },

  end: (args) => args.parent,
};

const bazHandlers: t.BuilderMethods<IModel, IBaz> = {
  increment(args) {
    type T = NonNullable<IModel['childObject']>;
    args.model.change((draft) => {
      jpath.apply(draft, args.path, (value: T) => {
        value.count++;
        return value;
      });
    });
  },
  parent: (args) => args.parent,
};

const itemHandlers: t.BuilderMethods<IModel, IItem> = {
  name(args) {
    args.model.change((draft) => {
      jpath.apply(draft, args.path, (value) => {
        const path = args.isList ? `${args.path}[${args.index}]` : args.path;

        jpath.apply(draft, path, (value: IModelItem) => {
          value.name = args.params[0];
          return value;
        });

        return value;
      });
    });
  },

  childField: {
    kind: 'object',
    path: 'child', // NB: relative starting point (does not start from "$" root).
    handlers: () => itemChildHandlers,
  },

  childByIndex: {
    kind: 'list:byIndex',
    path: 'children',
    handlers: () => itemChildHandlers,
  },

  parent: (args) => args.parent,
};

const itemChildHandlers: t.BuilderMethods<IModel, IItemChild> = {
  length(args) {
    args.model.change((draft) => {
      const { index } = args;

      if (args.isList) {
        const list = jpath.query(draft, args.path)[0];
        if (!list[index]) {
          list[index] = { count: 0 };
        }
      }

      const path = args.isList ? `${args.path}[${index}]` : args.path;
      jpath.apply(draft, path, (value: IModelItemChild) => {
        value.count = args.params[0];
        return value;
      });
    });
  },
  parent: (args) => args.parent,
};

const testModel = () => {
  const model = StateObject.create<IModel>({ name: '', foo: { list: [], map: {} } });
  const builder = Builder<IModel, IFoo>({ model, handlers: fooHandlers });
  return { model, builder };
};

describe.only('Builder', () => {
  describe('root', () => {
    it('returns builder', () => {
      const { builder } = testModel();
      expect(builder.name('foo')).to.equal(builder);
    });

    it('changes property on model', () => {
      const { model, builder } = testModel();
      expect(model.state.name).to.eql('');

      builder.name('foo').name('bar');
      expect(model.state.name).to.eql('bar');
    });
  });

  describe('kind: object', () => {
    it('updates model', () => {
      const { builder, model } = testModel();
      const bar = builder.bar;
      expect(typeof bar).to.eql('object');

      bar.count(123);
      expect(model.state.childObject?.count).to.eql(123);

      builder.bar.count(456).count(789);
      expect(model.state.childObject?.count).to.eql(789);
    });

    it('chains into child then [ends] stepping up to parent', () => {
      const { builder, model } = testModel();
      builder.bar
        // Step into child "bar"
        .count(123)
        .count(888)
        .end() // Step back up to parent.
        .name('hello');

      expect(model.state.childObject?.count).to.eql(888);
      expect(model.state.name).to.eql('hello');
    });

    it('chains deeply into multi-child levels', () => {
      const { builder, model } = testModel();

      builder.bar
        // Step down into Level-1
        .count(123)

        // Step down again into Level-2
        .baz.increment()
        .increment()
        .parent() // Step back up to Level-1
        .end() //    Step back up to Level-0
        .name('hello');

      expect(model.state.childObject?.count).to.eql(125);
      expect(model.state.name).to.eql('hello');
    });
  });

  describe('kind: list:byIndex', () => {
    it('creates with no index (insert at end)', () => {
      const { builder } = testModel();

      const res1 = builder.listByIndex();
      const res2 = builder.listByIndex(0).name('foo');
      expect(res1).to.equal(res2);

      const res3 = builder.listByIndex();
      expect(res1).to.not.equal(res3);
    });

    it('writes to model', () => {
      const { builder, model } = testModel();

      builder.listByIndex().name('foo').parent().listByIndex().name('bar');
      builder.listByIndex(5).name('baz');

      const list = model.state.foo.list;
      expect(list[0].name).to.eql('foo');
      expect(list[1].name).to.eql('bar');
      expect(list[5].name).to.eql('baz');
    });

    it('indexed grandchild (via field)', () => {
      const { builder, model } = testModel();
      const child = builder.listByIndex(1).name('foo');
      child.name('foo');

      const grandchild = child.childField;
      grandchild.length(101).parent().parent().name('root');

      const state = model.state;
      expect(state.name).to.eql('root');
      expect(state.foo.list[1].name).to.eql('foo');
      expect(state.foo.list[1].child?.count).to.eql(101);
    });

    it('indexed grandchild (via method)', () => {
      const { builder, model } = testModel();
      const child = builder.listByIndex(1).name('foo');
      child.name('foo');

      const grandchild = child.childByIndex(0);
      grandchild.length(99).length(101);

      const state = model.state;
      expect((state.foo.list[1].children || [])[0].count).to.eql(101);
    });
  });

  describe('kind: list:byName', () => {
    it('assigns "name" and adds item to end of list (default)', () => {
      const { builder, model } = testModel();
      const getList = () => model.state.foo.list;

      const child = builder.listByName('one');
      expect(getList()[0].name).to.eql('one');

      child.name('one-a').name('one-b');
      expect(getList()[0].name).to.eql('one-b');

      builder.listByName('two'); // NB: Added to end of list.
      expect(getList()[1].name).to.eql('two');
    });

    it('retrieves existing named item', () => {
      const { builder, model } = testModel();
      const getList = () => model.state.foo.list;

      builder.listByName('one');
      builder.listByName('two');

      builder.listByName('one').name('foo');
      builder.listByName('two').name('bar');

      const state = getList();
      expect(state[0].name).to.eql('foo');
      expect(state[1].name).to.eql('bar');
    });

    it('specify index: "START"', () => {
      const { builder, model } = testModel();
      const getList = () => model.state.foo.list;

      builder.listByName('one');
      builder.listByName('two');
      expect(getList()[0].name).to.eql('one');

      builder.listByName('jungle'); // NB: Adds to end (default)
      expect(getList()[0].name).to.eql('one');

      builder.listByName('foo', 'START'); // NB: Grabs the item as first and names it (replace).
      expect(getList()[0].name).to.eql('foo');

      builder.listByName('jungle', 'START'); // NB: "jungle" is not the first as it already exists in list, so that item-index was retrieved.
      expect(getList()[0].name).to.eql('foo');
      expect(getList()[2].name).to.eql('jungle');
    });

    it('specify index: number', () => {
      const { builder, model } = testModel();
      const getList = () => model.state.foo.list;

      builder.listByName('one');
      builder.listByName('two', 5);
      expect(getList()[0].name).to.eql('one');
      expect(getList()[5].name).to.eql('two');
    });

    it('specify index: function', () => {
      const { builder, model } = testModel();
      const getList = () => model.state.foo.list;

      builder.listByName('one');
      builder.listByName('two');
      builder.listByName('three');
      expect(getList()[0].name).to.eql('one');
      expect(getList()[1].name).to.eql('two');
      expect(getList()[2].name).to.eql('three');

      let args: t.BuilderIndexCalcArgs | undefined;
      builder.listByName('foo', (e) => {
        args = e;
        return 1;
      });

      expect(args?.total).to.eql(3);
      expect(args?.list.map((e) => e.name)).to.eql(['one', 'two', 'three']);
      expect(getList()[1].name).to.eql('foo');
    });

    it('throw: "name" not given', () => {
      const { builder } = testModel();
      const fn = () => builder.listByName(undefined as any);
      expect(fn).to.throw(/not given/);
    });

    it('throw: "name" empty string', () => {
      const { builder } = testModel();
      const fn = () => builder.listByName('   ');
      expect(fn).to.throw(/not given/);
    });
  });

  describe('kind: map', () => {
    it('assigns new child at "key" (generated default {object})', () => {
      const { builder, model } = testModel();
      const getMap = () => model.state.foo.map;

      const DEFAULT = { name: 'hello', child: { count: 0 }, children: [] };

      const child = builder.map('foo');
      expect(getMap().foo).to.eql(DEFAULT);

      child.name('bar').name('zoo');
      expect(getMap().foo.name).to.eql('zoo');
    });

    it('reuses existing child at "key"', () => {
      const { builder } = testModel();
      const child1 = builder.map('foo');
      const child2 = builder.map('foo');
      expect(child1).to.equal(child2);
    });

    it('throw: "key" not given', () => {
      const { builder } = testModel();
      const fn = () => builder.map(undefined as any);
      expect(fn).to.throw(/not given/);
    });

    it('throw: "key" empty string', () => {
      const { builder } = testModel();
      const fn = () => builder.map('   ' as any);
      expect(fn).to.throw(/not given/);
    });
  });

  describe.skip('composition', () => {
    type IModelOne = {};
    type IModelTwo = {};

    it('compose two builders', () => {
      //
      console.log('-------------------------------------------');
    });
  });
});

/**
 * TODO
 *
 * - composable (compose several builders together)
 *
 * [StateObject]
 *    - remove <A> (action/event) type. Convert to [string]. simpler.
 *
 */
