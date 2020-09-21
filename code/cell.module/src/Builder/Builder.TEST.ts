import { expect, t } from '../test';
import { Builder } from '.';
import { StateObject } from '@platform/state';

import * as jsonpath from 'jsonpath';

type IModel = {
  name: string;
  paths: string[];
  childObject?: { count: number };
};

type IFoo = {
  name: (value: string) => IFoo;
  bar: IBar;
};

type IBar = {
  count: (value: number) => IBar;
  baz: IBaz;
  end: () => IFoo;
};

type IBaz = {
  increment: () => IBaz;
  parent: () => IBar; // NB: "end" is not a convention, maybe we want to use "parent" instead.
};

const foo: t.BuilderMethods<IModel, IFoo> = {
  name: (args) => {
    args.model.change((draft) => (draft.name = args.params[0]));
  },
  bar: {
    type: 'CHILD/Object',
    path: '$.childObject',
    handlers: () => bar,
  },
};

const bar: t.BuilderMethods<IModel, IBar> = {
  count(args) {
    args.model.change((draft) => {
      type T = NonNullable<IModel['childObject']>;

      if (!jsonpath.query(draft, args.path)[0]) {
        draft.childObject = { count: args.params[0] };
      }

      jsonpath.apply(draft, args.path, (value: T) => {
        value.count = args.params[0];
        return value;
      });
    });
  },

  baz: {
    type: 'CHILD/Object',
    path: '$.childObject',
    handlers: () => baz,
  },

  end: (args) => args.parent,
};

const baz: t.BuilderMethods<IModel, IBaz> = {
  increment(args) {
    type T = NonNullable<IModel['childObject']>;
    args.model.change((draft) => {
      jsonpath.apply(draft, args.path, (value: T) => {
        value.count++;
        return value;
      });
    });
  },
  parent: (args) => args.parent,
};

const testModel = () => {
  const model = StateObject.create<IModel>({ name: '', paths: [] });
  const builder = Builder<IModel, IFoo>({ model, handlers: foo });
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

    it.only('chains deeply into multi-child levels', () => {
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
});
