import * as React from 'react';

import { expect, DEFAULT, StateObject, t } from '../../test';
import { ActionBuilder } from '.';
import { ActionPanel } from '../../components/ActionPanel';

type Ctx = { count: number };
type M = t.ActionModel<Ctx>;
type B = t.ActionModelBuilder<Ctx>;

function create() {
  const model = ActionBuilder.model<Ctx>();
  const builder = ActionBuilder.builder<Ctx>(model);
  return { model, builder };
}

describe('ActionBuilder', () => {
  describe('ActionBuilder.model()', () => {
    it('model', () => {
      const model = ActionBuilder.model();
      expect(model.state).to.eql(DEFAULT.ACTIONS);
    });

    it('model: default name', () => {
      const model = ActionBuilder.model();
      expect(model.state).to.eql(DEFAULT.ACTIONS);
    });
  });

  describe('ActionBuilder.builder()', () => {
    it('from no params', () => {
      const builder = ActionBuilder.builder();
      expect(builder.toObject()).to.eql(DEFAULT.ACTIONS);
    });

    it('from {model} StateObject', () => {
      const model = StateObject.create<M>({ ...DEFAULT.ACTIONS });
      const builder = ActionBuilder.builder(model);
      expect(builder.toObject()).to.eql(DEFAULT.ACTIONS);
    });

    it('from {model} object', () => {
      const model = StateObject.create<M>({ ...DEFAULT.ACTIONS });

      const builder = ActionBuilder.builder(model.state);
      expect(builder.toObject()).to.eql(DEFAULT.ACTIONS);
    });

    it('from <ActionPanel> component', () => {
      const builder = ActionPanel.build().button('hello');
      const obj = builder.toObject();
      expect((obj.items[0] as t.ActionItemButton).label).to.eql('hello');
    });

    it('from builder.toObject()', () => {
      const base = ActionBuilder.builder().button('hello');
      const builder = ActionBuilder.builder(base.toObject());
      expect(builder.toObject()).to.eql(base.toObject());
    });
  });

  describe('builder.render()', () => {
    it('JSX element', () => {
      const { builder, model } = create();
      const el = builder
        .context(() => ({ count: 123 }))
        .button('foo', () => null)
        .renderList();

      expect(React.isValidElement(el)).to.eql(true);
      expect(el.props.model.items).to.eql(model.state.items);

      const ctx = builder.toContext();
      expect(ctx).to.eql({ count: 123 });
      expect(el.props.getContext()).to.eql(ctx);
    });
  });

  describe('builder.context()', () => {
    it('assign: .context(...)', () => {
      const { model, builder } = create();
      expect(model.state.getContext).to.eql(undefined);

      const fn1: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.ActionGetContext<Ctx> = () => ({ count: 456 });

      builder.context(fn1);
      expect(model.state.getContext).to.eql(fn1);

      // Replace with another context function.
      builder.context(fn2);
      expect(model.state.getContext).to.eql(fn2);
    });

    it('throw if factory function not provided', () => {
      const { builder } = create();
      const fn = () => builder.context('foo' as any);
      expect(fn).to.throw(/Context factory function not provided/);
    });
  });

  describe('builder.toContext()', () => {
    it('no factory: null', () => {
      const { builder } = create();
      expect(builder.toContext()).to.eql(null);
    });

    it('read property and store on model (prev)', () => {
      const { builder, model } = create();
      let count = 0;
      let prev: Ctx | null = null;
      builder.context((input) => {
        prev = input;
        return { count };
      });

      expect(builder.toContext()).to.eql({ count: 0 });
      expect(model.state.ctx).to.eql({ count: 0 });
      expect(prev).to.eql(null);

      count = 123;
      expect(builder.toContext()).to.eql({ count: 123 });
      expect(model.state.ctx).to.eql({ count: 123 });
      expect(prev).to.eql({ count: 0 });
    });
  });

  describe('builder.clone()', () => {
    it('same context', () => {
      const { builder } = create();
      const fn: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const clone = builder.context(fn).clone();
      expect(clone).to.not.equal(builder); // NB: Different instance.
      expect(clone.toObject().getContext).to.eql(fn);
    });

    it('different context', () => {
      const { builder } = create();
      const fn1: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.ActionGetContext<Ctx> = () => ({ count: 456 });
      const clone = builder.context(fn1).clone(fn2);
      expect(clone).to.not.equal(builder); // NB: Different instance.
      expect(clone.toObject().getContext).to.eql(fn2);
    });
  });

  describe('builder.merge()', () => {
    type Button = t.ActionItemButton;
    const labels = (builder: B) => builder.toObject().items.map((btn) => (btn as Button).label);

    const one = create();
    const two = create();
    one.builder.button('one-a').button('one-b');
    two.builder.button('two-a').button('two-b');

    it('adds items to end (default)', () => {
      const builder1 = one.builder.clone();
      const builder2 = two.builder.clone();
      expect(labels(builder1)).to.eql(['one-a', 'one-b']);

      builder1.merge(builder2);
      expect(labels(builder1)).to.eql(['one-a', 'one-b', 'two-a', 'two-b']);
    });

    it('adds items to start', () => {
      const builder1 = one.builder.clone();
      const builder2 = two.builder.clone();
      expect(labels(builder1)).to.eql(['one-a', 'one-b']);

      builder1.merge(builder2, { insertAt: 'start' });
      expect(labels(builder1)).to.eql(['two-a', 'two-b', 'one-a', 'one-b']);
    });

    it('sets context-factory if not already set', () => {
      const builder1 = one.builder.clone();
      const builder2 = two.builder.clone();

      const fn: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      builder2.context(fn);

      builder1.merge(builder2);
      expect(builder1.toObject().getContext).to.eql(fn);
    });

    it('does not overwrite existing context factory', () => {
      const builder1 = one.builder.clone();
      const builder2 = two.builder.clone();

      const fn1: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.ActionGetContext<Ctx> = () => ({ count: 456 });
      builder1.context(fn1);
      builder2.context(fn2);

      builder1.merge(builder2);
      expect(builder1.toObject().getContext).to.eql(fn1);
    });
  });

  describe('builder.button()', () => {
    it('label, handler', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.ActionHandler<any> = () => null;
      const fn2: t.ActionHandler<any> = () => null;
      builder.button('  foo  ', fn1).button('bar', fn1).button('foo', fn2);

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const button1 = items[0] as t.ActionItemButton;
      const button2 = items[1] as t.ActionItemButton;
      const button3 = items[2] as t.ActionItemButton;

      expect(button1.type).to.eql('button');
      expect(button1.label).to.eql('foo');
      expect(button1.onClick).to.eql(fn1);

      expect(button2.type).to.eql('button');
      expect(button2.label).to.eql('bar');
      expect(button2.onClick).to.eql(fn1);

      expect(button3.type).to.eql('button');
      expect(button3.label).to.eql('foo');
      expect(button3.onClick).to.eql(fn2);
    });

    it('label (no handler)', () => {
      const { builder, model } = create();

      builder.button('foo');

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.ActionItemButton;
      expect(button.label).to.eql('foo');
      expect(button.onClick).to.eql(undefined);
    });

    it('config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      const fn: t.ActionHandler<any> = () => null;
      builder.button((config) => config.label('foo').onClick(fn));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      expect(items[0].type).to.eql('button');

      const button = items[0] as t.ActionItemButton;
      expect(button.type).to.eql('button');
      expect(button.onClick).to.eql(fn);
    });

    it('config: "Unnamed"', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => null);

      const items = model.state.items;
      const button = items[0] as t.ActionItemButton;
      expect(button.type).to.eql('button');
      expect(button.label).to.eql('Unnamed');
    });

    it('config: "Unnamed" (via empty value)', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => config.label('hello').label('  '));

      const items = model.state.items;
      const button = items[0] as t.ActionItemButton;
      expect(button.type).to.eql('button');
      expect(button.label).to.eql('Unnamed');
    });

    it('config: description', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => config.label('foo').description('   My description   '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.ActionItemButton;
      expect(button.type).to.eql('button');
      expect(button.description).to.eql('My description');
    });
  });

  describe('builder.hr()', () => {
    it('param: none', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.hr();

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionItemHr;
      expect(item.type).to.eql('hr');
      expect(item.height).to.eql(8);
      expect(item.opacity).to.eql(0.06);
      expect(item.margin).to.eql([8, 8]);
    });

    it('param: fn', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.hr((config) => config.height(1).opacity(0.3));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionItemHr;
      expect(item.type).to.eql('hr');
      expect(item.height).to.eql(1);
      expect(item.opacity).to.eql(0.3);
    });

    it('params: number (height, opacity, margin)', () => {
      const { builder, model } = create();

      builder.hr().hr(3).hr(1, 0.2, [10, 20, 30, 40]);

      type H = t.ActionItemHr;
      const items = model.state.items;
      const item1 = items[0] as H;
      const item2 = items[1] as H;
      const item3 = items[2] as H;

      expect(item1.height).to.eql(8);
      expect(item2.height).to.eql(3);
      expect(item3.height).to.eql(1);

      expect(item1.opacity).to.eql(0.06);
      expect(item2.opacity).to.eql(0.06);
      expect(item3.opacity).to.eql(0.2);

      expect(item1.margin).to.eql([8, 8]);
      expect(item2.margin).to.eql([8, 8]);
      expect(item3.margin).to.eql([10, 20, 30, 40]);
    });

    it('min-height: 0', () => {
      const { builder, model } = create();
      builder.hr().hr((config) => config.height(-1));

      type H = t.ActionItemHr;
      const items = model.state.items;
      const item1 = items[0] as H;
      const item2 = items[1] as H;

      expect(item1.height).to.eql(8); // NB: default
      expect(item2.height).to.eql(0);
    });

    it('opacity: clamp 0..1', () => {
      const { builder, model } = create();

      builder
        .hr()
        .hr((config) => config.opacity(99))
        .hr((config) => config.opacity(-1));

      type H = t.ActionItemHr;
      const items = model.state.items;
      const item1 = items[0] as H;
      const item2 = items[1] as H;
      const item3 = items[2] as H;

      expect(item1.opacity).to.eql(0.06); // NB: default.
      expect(item2.opacity).to.eql(1);
      expect(item3.opacity).to.eql(0);
    });

    it('margin: 0', () => {
      const { builder, model } = create();
      builder
        .hr((config) => config.margin(1))
        .hr((config) => config.margin([5, 10]))
        .hr((config) => config.margin([1, 2, 3, 4]));

      type H = t.ActionItemHr;
      const items = model.state.items;
      const item1 = items[0] as H;
      const item2 = items[1] as H;
      const item3 = items[2] as H;

      expect(item1.margin).to.eql(1); // NB: default
      expect(item2.margin).to.eql([5, 10]);
      expect(item3.margin).to.eql([1, 2, 3, 4]);
    });
  });

  describe('builder.title()', () => {
    it('string: Untitled', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title('  ');

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionItemTitle;
      expect(item.type).to.eql('title');
      expect(item.text).to.eql('Untitled');
    });

    it('string: "My Title"', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title('  My Title  ');

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionItemTitle;
      expect(item.type).to.eql('title');
      expect(item.text).to.eql('My Title');
    });

    it('config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title((config) => config.text('  Hello  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionItemTitle;
      expect(item.type).to.eql('title');
      expect(item.text).to.eql('Hello');
    });

    it('string, config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title('My Title', (config) => config.text('  Hello  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionItemTitle;
      expect(item.type).to.eql('title');
      expect(item.text).to.eql('Hello');
    });
  });
});
