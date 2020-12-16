import * as React from 'react';

import { expect, DEFAULT, StateObject, t } from '../test';
import { ActionBuilder } from '.';
import { ActionPanel } from '../components/ActionPanel';

type Ctx = { count: number };
type M = t.ActionModel<Ctx>;

function create() {
  const model = ActionBuilder.model<Ctx>('foo');
  const builder = ActionBuilder.builder<Ctx>(model);
  return { model, builder };
}

describe('ActionBuilder', () => {
  describe('create: .model()', () => {
    it('model', () => {
      const model = ActionBuilder.model('  foo  ');
      expect(model.state).to.eql({ ...DEFAULT.ACTIONS, name: 'foo' });
    });

    it('model: default name', () => {
      const model = ActionBuilder.model();
      expect(model.state).to.eql(DEFAULT.ACTIONS);
    });
  });

  describe('create: .builder()', () => {
    it('from no params', () => {
      const builder = ActionBuilder.builder();
      expect(builder.toObject()).to.eql(DEFAULT.ACTIONS);
    });

    it('from "name"', () => {
      const builder = ActionBuilder.builder('  foo  ');
      expect(builder.toObject()).to.eql({ ...DEFAULT.ACTIONS, name: 'foo' });
    });

    it('from {model} StateObject', () => {
      const model = StateObject.create<M>({
        ...DEFAULT.ACTIONS,
        name: 'foo',
      });
      const builder = ActionBuilder.builder(model);

      const obj = builder.toObject();
      expect(obj.name).to.eql('foo');
    });

    it('from {model} object', () => {
      const model = StateObject.create<M>({
        ...DEFAULT.ACTIONS,
        name: 'foo',
      });

      const builder = ActionBuilder.builder(model.state);

      const obj = builder.toObject();
      expect(obj.name).to.eql('foo');
    });

    it('from <ActionPanel> component', () => {
      const builder = ActionPanel.build('foo');
      const obj = builder.toObject();
      expect(obj.name).to.eql('foo');
    });

    it('from builder.toObject()', () => {
      const base = ActionBuilder.builder('base');
      const builder = ActionBuilder.builder(base.toObject());
      expect(builder.toObject()).to.eql(base.toObject());
    });
  });

  describe('toModel', () => {
    it('from model (no change)', () => {
      const input = { ...DEFAULT.ACTIONS };
      expect(ActionBuilder.toModel(input)).to.equal(input);
    });

    it('from state-object', () => {
      const input = StateObject.create<M>(DEFAULT.ACTIONS);
      const res = ActionBuilder.toModel(input);
      expect(res).to.eql(DEFAULT.ACTIONS);
      expect(StateObject.isStateObject(input)).to.eql(true);
      expect(StateObject.isStateObject(res)).to.eql(false);
    });

    it('from builder', () => {
      const { model, builder } = create();
      const res = ActionBuilder.toModel(builder);
      expect(res).to.eql(model.state);
    });

    it('not convertable', () => {
      const test = (input?: any) => {
        expect(ActionBuilder.toModel(input)).to.eql(undefined);
      };
      test();
      test(null);
      test('');
      test(123);
      test([1, 2, 3]);
    });
  });

  describe('methods', () => {
    it('name', () => {
      const { model, builder } = create();
      expect(model.state.name).to.eql('foo');

      builder.name('bar').name('zoo');
      expect(model.state.name).to.eql('zoo');

      builder.name(null);
      expect(model.state.name).to.eql('');

      builder.name('  ');
      expect(model.state.name).to.eql('');
    });

    describe('render', () => {
      it('produces JSX element', () => {
        const { builder, model } = create();
        const el = builder
          .name('hello')
          .button('foo', () => null)
          .render();

        expect(React.isValidElement(el)).to.eql(true);

        expect(el.props.actions.name).to.eql('hello');
        expect(el.props.actions.items).to.eql(model.state.items);
      });
    });

    describe('context', () => {
      it('set', () => {
        const { model, builder } = create();
        expect(model.state.getContext).to.eql(undefined);

        const getContext: t.ActionGetContext<Ctx> = () => ({ count: 123 });
        builder.context(getContext);
        expect(model.state.getContext).to.eql(getContext);
      });

      it('throw if function not provided', () => {
        const { builder } = create();
        const fn = () => builder.context('foo' as any);
        expect(fn).to.throw(/Context factory function not provided/);
      });
    });

    describe('clone', () => {
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

    describe('group', () => {
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
          e
            .button('One', handler1)
            .button((config) => config.description('Hello').onClick(handler2)),
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

    describe('button', () => {
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
  });
});
