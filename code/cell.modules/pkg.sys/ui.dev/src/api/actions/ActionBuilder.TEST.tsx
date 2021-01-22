import * as React from 'react';

import { expect, DEFAULT, StateObject, t } from '../../test';
import { ActionBuilder } from '.';
import { ActionPanel } from '../../components/ActionPanel';

type Ctx = { count: number };
type M = t.DevActionModel<Ctx>;
type B = t.DevActionModelBuilder<Ctx>;

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
      expect((obj.items[0] as t.DevActionItemButton).label).to.eql('hello');
    });

    it('from builder.toObject()', () => {
      const base = ActionBuilder.builder().button('hello');
      const builder = ActionBuilder.builder(base.toObject());
      expect(builder.toObject()).to.eql(base.toObject());
    });
  });

  describe('builder.renderList()', () => {
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

  describe.only('builder.renderSubject()', () => {
    it('factory not set (default values)', () => {
      const { builder } = create();
      const res = builder.renderSubject();
      expect(res.items).to.eql([]);
      expect(res.orientation).to.eql('y'); // NB: vertical stack
      expect(res.layout).to.eql({});
      expect(res.spacing).to.eql(20);
    });

    it('passes context', () => {
      const { builder } = create();
      const ctx = { count: 123 };
      let payload: t.DevActionRenderSubjectArgs<Ctx> | undefined;
      const res = builder
        .context(() => ctx)
        .subject((e) => (payload = e))
        .renderSubject();

      expect(res.items).to.eql([]);
      expect(payload?.ctx).to.eql(ctx);
    });

    it('orientation (stacking direction)', () => {
      const { builder } = create();
      const res0 = builder.renderSubject();
      const res1 = builder.subject((e) => e.orientation('x')).renderSubject();
      const res2 = builder.subject((e) => e.orientation('y')).renderSubject();
      expect(res0.orientation).to.eql('y'); // NB: default
      expect(res1.orientation).to.eql('x');
      expect(res2.orientation).to.eql('y');
    });

    it('single element', () => {
      const { builder } = create();
      const div = <div>Foo</div>;
      const res = builder.subject((e) => e.render(div)).renderSubject();

      expect(res.orientation).to.eql('y');
      expect(res.items.length).to.eql(1);
      expect(res.items[0].el).to.equal(div);
      expect(res.items[0].layout).to.eql(undefined);
    });

    it('multiple elements (stack)', () => {
      const { builder } = create();
      const res = builder
        .subject((e) => {
          e.render(<h1>Foo</h1>)
            .render(<div>Hello</div>, { label: 'MyLabel' })
            .orientation('x'); // NB: horizontal stack
        })
        .renderSubject();

      const items = res.items;
      expect(res.orientation).to.eql('x');
      expect(items[0].el.type).to.equal('h1');
      expect(items[1].el.type).to.equal('div');

      expect(items[0].layout?.label).to.equal(undefined);
      expect(items[1].layout?.label).to.equal('MyLabel');
    });

    it('layout: item (explicit)', () => {
      const { builder } = create();
      const div = <div>Foo</div>;

      const res = builder.subject((e) => e.render(div, { label: 'MyLabel' })).renderSubject();
      expect(res.layout).to.eql({});

      const item = res.items[0];
      expect(item.el).to.equal(div);
      expect(item.layout).to.eql({ label: 'MyLabel' });
    });

    it('layout: shared across all items', () => {
      const { builder } = create();
      const div = <div>Foo</div>;
      const res = builder
        .subject((e) => e.layout({ label: 'MyLabel' }).render(div))
        .renderSubject();
      expect(res.layout).to.eql({ label: 'MyLabel' });
    });

    it('orentation: spacing', () => {
      const { builder } = create();
      const res0 = builder.renderSubject();
      const res1 = builder.subject((e) => e.orientation('x', 50)).renderSubject();
      const res2 = builder.subject((e) => e.orientation('y', -10)).renderSubject();
      expect(res0.spacing).to.eql(20); // NB: default
      expect(res1.spacing).to.eql(50);
      expect(res2.spacing).to.eql(0); // NB: Clamped: >0
    });
  });

  describe('builder.context()', () => {
    it('assign: .context(...)', () => {
      const { model, builder } = create();
      expect(model.state.getContext).to.eql(undefined);

      const fn1: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.DevActionGetContext<Ctx> = () => ({ count: 456 });

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

  describe('builder.subject', () => {
    it('stores root subject factory', () => {
      const { model, builder } = create();
      expect(model.state.renderSubject).to.eql(undefined);

      const fn1: t.DevActionRenderSubject<Ctx> = (e) => null;
      const fn2: t.DevActionRenderSubject<Ctx> = (e) => null;

      builder.subject(fn1);
      expect(model.state.renderSubject).to.eql(fn1);

      // Replace with another factory.
      builder.subject(fn2);
      expect(model.state.renderSubject).to.eql(fn2);
    });

    it('throw if factory function not provided', () => {
      const { builder } = create();
      const fn = () => builder.subject('foo' as any);
      expect(fn).to.throw(/Subject factory function not provided/);
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
      const fn: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      const clone = builder.context(fn).clone();
      expect(clone).to.not.equal(builder); // NB: Different instance.
      expect(clone.toObject().getContext).to.eql(fn);
    });

    it('different context', () => {
      const { builder } = create();
      const fn1: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.DevActionGetContext<Ctx> = () => ({ count: 456 });
      const clone = builder.context(fn1).clone(fn2);
      expect(clone).to.not.equal(builder); // NB: Different instance.
      expect(clone.toObject().getContext).to.eql(fn2);
    });
  });

  describe('builder.merge()', () => {
    type Button = t.DevActionItemButton;
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

      const fn: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      builder2.context(fn);

      builder1.merge(builder2);
      expect(builder1.toObject().getContext).to.eql(fn);
    });

    it('does not overwrite existing context factory', () => {
      const builder1 = one.builder.clone();
      const builder2 = two.builder.clone();

      const fn1: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.DevActionGetContext<Ctx> = () => ({ count: 456 });
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

      const fn1: t.DevActionHandler<any> = () => null;
      const fn2: t.DevActionHandler<any> = () => null;
      builder.button('  foo  ', fn1).button('bar', fn1).button('foo', fn2);

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const button1 = items[0] as t.DevActionItemButton;
      const button2 = items[1] as t.DevActionItemButton;
      const button3 = items[2] as t.DevActionItemButton;

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

      const button = items[0] as t.DevActionItemButton;
      expect(button.label).to.eql('foo');
      expect(button.onClick).to.eql(undefined);
    });

    it('config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      const fn: t.DevActionHandler<any> = () => null;
      builder.button((config) => config.label('foo').onClick(fn));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      expect(items[0].type).to.eql('button');

      const button = items[0] as t.DevActionItemButton;
      expect(button.type).to.eql('button');
      expect(button.onClick).to.eql(fn);
    });

    it('config: "Unnamed"', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => null);

      const items = model.state.items;
      const button = items[0] as t.DevActionItemButton;
      expect(button.type).to.eql('button');
      expect(button.label).to.eql('Unnamed');
    });

    it('config: "Unnamed" (via empty value)', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => config.label('hello').label('  '));

      const items = model.state.items;
      const button = items[0] as t.DevActionItemButton;
      expect(button.type).to.eql('button');
      expect(button.label).to.eql('Unnamed');
    });

    it('config: description', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => config.label('foo').description('   My description   '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.DevActionItemButton;
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

      const item = items[0] as t.DevActionItemHr;
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

      const item = items[0] as t.DevActionItemHr;
      expect(item.type).to.eql('hr');
      expect(item.height).to.eql(1);
      expect(item.opacity).to.eql(0.3);
    });

    it('params: number (height, opacity, margin)', () => {
      const { builder, model } = create();

      builder.hr().hr(3).hr(1, 0.2, [10, 20, 30, 40]);

      type H = t.DevActionItemHr;
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

      type H = t.DevActionItemHr;
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

      type H = t.DevActionItemHr;
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

      type H = t.DevActionItemHr;
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

      const item = items[0] as t.DevActionItemTitle;
      expect(item.type).to.eql('title');
      expect(item.text).to.eql('Untitled');
    });

    it('string: "My Title"', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title('  My Title  ');

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.DevActionItemTitle;
      expect(item.type).to.eql('title');
      expect(item.text).to.eql('My Title');
    });

    it('config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title((config) => config.text('  Hello  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.DevActionItemTitle;
      expect(item.type).to.eql('title');
      expect(item.text).to.eql('Hello');
    });

    it('string, config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title('My Title', (config) => config.text('  Hello  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.DevActionItemTitle;
      expect(item.type).to.eql('title');
      expect(item.text).to.eql('Hello');
    });
  });
});
