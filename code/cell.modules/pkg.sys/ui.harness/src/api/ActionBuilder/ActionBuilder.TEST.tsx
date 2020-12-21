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
      const builder = ActionPanel.build().group('hello');
      const obj = builder.toObject();
      expect((obj.items[0] as t.ActionItemGroup).name).to.eql('hello');
    });

    it('from builder.toObject()', () => {
      const base = ActionBuilder.builder().group('hello');
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
        .render();

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

  describe('builder.group()', () => {
    it('param: "name"', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.group('Group 1').group('Group 2', (e) => e.name('renamed'));

      const items = model.state.items;
      expect(items.length).to.eql(2);

      const group1 = items[0] as t.ActionItemGroup;
      const group2 = items[1] as t.ActionItemGroup;

      expect(group1.name).to.eql('Group 1');
      expect(group2.name).to.eql('renamed');
    });

    it('config: "Unnamed"', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.group((e) => null).group((e) => null);

      const items = model.state.items;
      expect(items.length).to.eql(2);

      const test = (i: number) => {
        const group = items[i] as t.ActionItemGroup;
        expect(items[i].type).to.eql('group');
        expect(group.name).to.eql('Unnamed');
        expect(group.items).to.eql([]);
      };
      test(0);
      test(1);
    });

    it('config.name', () => {
      const { builder, model } = create();
      builder.group((e) => e.name('  Hello  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const group = items[0] as t.ActionItemGroup;
      expect(group.type).to.eql('group');
      expect(group.name).to.eql('Hello');
    });

    it('group: buttons', () => {
      const { builder, model } = create();

      const handler1 = () => null;
      const handler2 = () => null;

      builder.group((e) =>
        e.button('One', handler1).button((config) => config.description('Hello').onClick(handler2)),
      );

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const group = items[0] as t.ActionItemGroup;

      expect(group.type).to.eql('group');
      expect(group.items.length).to.eql(2);

      const button1 = group.items[0] as t.ActionItemButton;
      const button2 = group.items[1] as t.ActionItemButton;

      expect(button1.type).to.eql('button');
      expect(button2.type).to.eql('button');

      expect(button1.label).to.eql('One');
      expect(button2.label).to.eql('Unnamed');

      expect(button1.description).to.eql(undefined);
      expect(button2.description).to.eql('Hello');

      expect(button1.onClick).to.eql(handler1);
      expect(button2.onClick).to.eql(handler2);
    });
  });

  describe('builder.merge()', () => {
    type G = t.ActionItemGroup;
    const names = (builder: B) => builder.toObject().items.map((item) => (item as G).name);

    const one = create();
    const two = create();
    one.builder.group('one-a').group('one-b');
    two.builder.group('two-a').group('two-b');

    it('adds items to end (default)', () => {
      const builder1 = one.builder.clone();
      const builder2 = two.builder.clone();
      expect(names(builder1)).to.eql(['one-a', 'one-b']);

      builder1.merge(builder2);
      expect(names(builder1)).to.eql(['one-a', 'one-b', 'two-a', 'two-b']);
    });

    it('adds items to start', () => {
      const builder1 = one.builder.clone();
      const builder2 = two.builder.clone();
      expect(names(builder1)).to.eql(['one-a', 'one-b']);

      builder1.merge(builder2, { insertAt: 'start' });
      expect(names(builder1)).to.eql(['two-a', 'two-b', 'one-a', 'one-b']);
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
    it('base', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.hr();

      const items = model.state.items;
      expect(items.length).to.eql(1);
      expect(items[0].type).to.eql('hr');
    });

    it('group', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.group('foo', (config) => config.hr());

      const items = model.state.items;
      expect(items.length).to.eql(1);
      expect(items[0].type).to.eql('group');

      const group = items[0] as t.ActionItemGroup;

      expect(group.items.length).to.eql(1);
      expect(group.items[0].type).to.eql('hr');
    });
  });
});
