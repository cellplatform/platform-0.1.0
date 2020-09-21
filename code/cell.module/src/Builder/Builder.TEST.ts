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
  lists: { indexed: IModelItem[]; named: IModelItem[] };
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
  byIndex(index?: number): IItem;
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
  child: IItemChild;
  // childMethod(): IItemChild
  parent(): IFoo;
};
type IItemChild = {
  count(value: number): IItemChild;
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
    kind: 'CHILD/object',
    path: '$.childObject',
    handlers: () => barHandlers,
  },
  byIndex: {
    kind: 'CHILD/list/byIndex',
    path: '$.lists.indexed',
    handlers: () => itemHandlers,
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
    kind: 'CHILD/object',
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
        const path = `${args.path}[${args.index}]`;

        if (!jpath.query(draft, path)[0]) {
          draft.lists.indexed[args.index] = { name: '', child: { count: 0 }, children: [] };
        }

        jpath.apply(draft, path, (value: IModelItem) => {
          value.name = args.params[0];
          return value;
        });

        return value;
      });
    });
  },

  child: {
    kind: 'CHILD/object',
    path: 'child', // NB: relative starting point (does not start from "$" root).
    handlers: () => itemChildHandlers,
  },

  parent: (args) => args.parent,
};

const itemChildHandlers: t.BuilderMethods<IModel, IItemChild> = {
  count(args) {
    args.model.change((draft) => {
      jpath.apply(draft, args.path, (value: IModelItemChild) => {
        value.count = args.params[0];
        return value;
      });
    });
  },
  parent: (args) => args.parent,
};

const testModel = () => {
  const model = StateObject.create<IModel>({ name: '', lists: { indexed: [], named: [] } });
  const builder = Builder<IModel, IFoo>({ model, handlers: fooHandlers });
  return { model, builder };
};

describe.only('Builder', () => {
  describe('builder: root', () => {
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

  describe('builder: CHILD/Object', () => {
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

  describe('builder: CHILD/list/index', () => {
    it('creates with no index (insert at end)', () => {
      const { builder } = testModel();

      const res1 = builder.byIndex();
      const res2 = builder.byIndex(0).name('foo');
      expect(res1).to.equal(res2);

      const res3 = builder.byIndex();
      expect(res1).to.not.equal(res3);
    });

    it('writes to model', () => {
      const { builder, model } = testModel();

      builder.byIndex().name('foo').parent().byIndex().name('bar');
      builder.byIndex(5).name('baz');

      const list = model.state.lists.indexed;
      expect(list[0].name).to.eql('foo');
      expect(list[1].name).to.eql('bar');
      expect(list[5].name).to.eql('baz');
    });

    it('deeper child on indexed child', () => {
      const { builder, model } = testModel();

      const child = builder.byIndex(1).name('foo');
      child.name('foo');

      const grandchild = child.child;
      grandchild.count(99).count(101).parent().parent().name('root');

      const state = model.state;
      expect(state.name).to.eql('root');
      expect(state.lists.indexed[1].name).to.eql('foo');
      expect(state.lists.indexed[1].child.count).to.eql(101);
    });
  });
});

/**
 * TODO
 * - index (by key/name) - return singleton
 * - TEST deep index (from method)
 * - map
 */
