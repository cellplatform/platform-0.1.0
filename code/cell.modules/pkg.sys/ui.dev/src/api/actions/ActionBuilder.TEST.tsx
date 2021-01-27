import * as React from 'react';

import { expect, DEFAULT, StateObject, t, rx, is, toObject } from '../../test';
import { ActionBuilder } from '.';
import { ActionPanelProps } from '../../components/ActionPanel';

type Ctx = { count: number };
type M = t.DevActionsModel<Ctx>;
type A = t.DevActionsChangeType;
type B = t.DevActions<Ctx>;

function create() {
  const model = ActionBuilder.model<Ctx>();
  const builder = ActionBuilder.api<Ctx>(model);
  const bus = rx.bus();
  return { model, builder, bus };
}

describe('ActionBuilder', () => {
  describe('ActionBuilder.model()', () => {
    it('model', () => {
      const model = ActionBuilder.model();
      const ns = model.state.ns;
      expect(ns).not.to.eql('');
      expect(model.state).to.eql({ ...DEFAULT.ACTIONS, ns });
      expect(model.state.name).to.eql(DEFAULT.UNNAMED);
    });
  });

  describe('ActionBuilder.builder()', () => {
    it('from no params', () => {
      const builder = ActionBuilder.api();
      const obj = builder.toObject();
      expect(obj).to.eql({ ...DEFAULT.ACTIONS, ns: obj.ns });
    });

    it('from {model} StateObject', () => {
      const model = StateObject.create<M, A>({ ...DEFAULT.ACTIONS });
      const builder = ActionBuilder.api(model);
      const obj = builder.toObject();
      expect(obj).to.eql({ ...DEFAULT.ACTIONS, ns: obj.ns });
    });

    it('from {model} object', () => {
      const model = StateObject.create<M>({ ...DEFAULT.ACTIONS });
      const builder = ActionBuilder.api(model.state);
      const obj = builder.toObject();
      expect(obj).to.eql({ ...DEFAULT.ACTIONS, ns: obj.ns });
    });

    it('from builder.toObject() - model state', () => {
      const base = ActionBuilder.api().button('hello');
      const builder = ActionBuilder.api(base.toObject());
      const obj = builder.toObject();
      expect(obj).to.eql(base.toObject());
    });

    it('from builder.toModel() - model state', () => {
      const base = ActionBuilder.api().button('hello');
      const builder = ActionBuilder.api(base.toObject());
      const model = builder.toModel();
      expect(model.state).to.eql(base.toObject());
      expect(model.change).to.be.an.instanceof(Function);
    });

    it('from builder.toEvents()', () => {
      const base = ActionBuilder.api().button('hello');
      const builder = ActionBuilder.api(base.toObject());
      const obj = builder.toEvents();
      expect(is.observable(obj.$)).to.eql(true);
      expect(is.observable(obj.changed$)).to.eql(true);
    });
  });

  describe('builder.renderList()', () => {
    it('JSX element', () => {
      const { builder, model, bus } = create();
      const el = builder
        .context(() => ({ count: 123 }))
        .button('foo', () => null)
        .renderList(bus, { scrollable: false });

      expect(React.isValidElement(el)).to.eql(true);

      const props: ActionPanelProps = el.props;
      expect(props.actions.toObject().items).to.eql(model.state.items);
      expect(props.scrollable).to.eql(false);
      expect(props.bus).to.equal(bus);
    });

    it('throw: bus not provided', () => {
      const { builder } = create();
      const fn = () => builder.renderList({} as any);
      expect(fn).to.throw(/Event bus not provided/);
    });
  });

  describe('builder.renderSubject()', () => {
    it('factory not set (default values)', () => {
      const { builder } = create();
      const res = builder.context(() => ({ count: 1234 })).renderSubject();
      expect(res.items).to.eql([]);
      expect(res.layout).to.eql({});
    });

    it('passes context', () => {
      const { builder } = create();
      const ctx = { count: 123 };

      let fired: any = undefined;
      const res = builder
        .context(() => ctx)
        .subject((e) => (fired = toObject(e.ctx)))
        .renderSubject();

      expect(res.items).to.eql([]);
      expect(res.ctx).to.eql(ctx);
      expect(fired).to.eql(ctx);
    });

    it('single element', () => {
      const { builder, model } = create();
      const div = <div>Foo</div>;
      const res = builder
        .context(() => ({ count: 1234 }))
        .subject((e) => e.settings({ host: { orientation: 'y' } }).render(div))
        .renderSubject();

      expect(res.items.length).to.eql(1);
      expect(res.items[0].el).to.equal(div);
      expect(res.items[0].layout).to.eql(undefined);
      expect(model.state.env.viaSubject.host?.orientation).to.eql('y');
    });

    it('multiple elements (stack)', () => {
      const { builder, model } = create();
      const res = builder
        .context(() => ({ count: 1234 }))
        .subject((e) => {
          e.render(<h1>Foo</h1>).render(<div>Hello</div>, { label: 'MyLabel' });
          e.host.orientation = 'x';
          e.host.spacing = 100;
        })
        .renderSubject();
      const items = res.items;
      expect(items[0].el.type).to.equal('h1');
      expect(items[1].el.type).to.equal('div');
      expect(items[0].layout?.label).to.equal(undefined);
      expect(items[1].layout?.label).to.equal('MyLabel');

      const viaSubject = model.state.env.viaSubject;
      expect(viaSubject.host?.orientation).to.eql('x');
      expect(viaSubject.host?.spacing).to.eql(100);
    });

    it('layout: item (explicit)', () => {
      const { builder } = create();
      const div = <div>Foo</div>;

      const res = builder
        .context(() => ({ count: 1234 }))
        .subject((e) => e.render(div, { label: 'MyLabel' }))
        .renderSubject();
      expect(res.layout).to.eql({});

      const item = res.items[0];
      expect(item.el).to.equal(div);
      expect(item.layout).to.eql({ label: 'MyLabel' });
    });

    it('layout/host: shared across all items', () => {
      const { builder, model } = create();
      const div = <div>Foo</div>;
      builder
        .context(() => ({ count: 1234 }))
        .subject((e) => {
          e.settings({ host: { orientation: 'x' }, layout: { label: 'MyLabel' } }).render(div);
        })
        .renderSubject();

      const viaSubject = model.state.env.viaSubject;
      expect(viaSubject.host?.orientation).to.eql('x');
      expect(viaSubject.layout?.label).to.eql('MyLabel');
    });
  });

  describe('builder.context()', () => {
    it('assign: .context(...)', () => {
      const { model, builder } = create();
      expect(model.state.ctx.get).to.eql(undefined);

      const fn1: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.DevActionGetContext<Ctx> = () => ({ count: 456 });

      builder.context(fn1);
      expect(model.state.ctx.get).to.eql(fn1);

      // Replace with another context function.
      builder.context(fn2);
      expect(model.state.ctx.get).to.eql(fn2);
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

      const fn1: t.DevActionHandlerSubject<Ctx> = (e) => null;
      const fn2: t.DevActionHandlerSubject<Ctx> = (e) => null;

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
      expect(model.state.ctx.current).to.eql({ count: 0 });
      expect(prev).to.eql(null);

      count = 123;
      expect(builder.toContext()).to.eql({ count: 123 });
      expect(model.state.ctx.current).to.eql({ count: 123 });
      expect(prev).to.eql({ count: 0 });
    });
  });

  describe('builder.clone()', () => {
    it('same context', () => {
      const { builder } = create();
      const fn: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      const clone = builder.context(fn).clone();
      expect(clone).to.not.equal(builder); // NB: Different instance.
      expect(clone.toObject().ctx.get).to.eql(fn);
    });

    it('different context', () => {
      const { builder } = create();
      const fn1: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.DevActionGetContext<Ctx> = () => ({ count: 456 });
      const clone = builder.context(fn1).clone(fn2);
      expect(clone).to.not.equal(builder); // NB: Different instance.
      expect(clone.toObject().ctx.get).to.eql(fn2);
    });
  });

  describe('builder.merge()', () => {
    type Button = t.DevActionButton;
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
      expect(builder1.toObject().ctx.get).to.eql(fn);
    });

    it('does not overwrite existing context factory', () => {
      const builder1 = one.builder.clone();
      const builder2 = two.builder.clone();

      const fn1: t.DevActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.DevActionGetContext<Ctx> = () => ({ count: 456 });
      builder1.context(fn1);
      builder2.context(fn2);

      builder1.merge(builder2);
      expect(builder1.toObject().ctx.get).to.eql(fn1);
    });
  });

  describe('builder.name()', () => {
    it('sets name', () => {
      const { builder, model } = create();
      expect(model.state.name).to.eql(DEFAULT.UNNAMED);

      builder.name('   Foobar  ');

      expect(model.state.name).to.eql('Foobar');

      builder.name('  ');
      expect(model.state.name).to.eql(DEFAULT.UNNAMED);

      builder.name('foo').name(undefined as any);
      expect(model.state.name).to.eql(DEFAULT.UNNAMED);
    });
  });

  describe('builder.button()', () => {
    it('label, handler', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.DevActionButtonHandler<any> = () => null;
      const fn2: t.DevActionButtonHandler<any> = () => null;
      builder.button('  foo  ', fn1).button('bar', fn1).button('foo', fn2);

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const button1 = items[0] as t.DevActionButton;
      const button2 = items[1] as t.DevActionButton;
      const button3 = items[2] as t.DevActionButton;

      expect(button1.kind).to.eql('button');
      expect(button1.label).to.eql('foo');
      expect(button1.handler).to.eql(fn1);

      expect(button2.kind).to.eql('button');
      expect(button2.label).to.eql('bar');
      expect(button2.handler).to.eql(fn1);

      expect(button3.kind).to.eql('button');
      expect(button3.label).to.eql('foo');
      expect(button3.handler).to.eql(fn2);
    });

    it('label (no handler)', () => {
      const { builder, model } = create();

      builder.button('foo');

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.DevActionButton;
      expect(button.label).to.eql('foo');
      expect(button.handler).to.eql(undefined);
    });

    it('config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      const fn: t.DevActionButtonHandler<any> = () => null;
      builder.button((config) => config.label('foo').handler(fn));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      expect(items[0].kind).to.eql('button');

      const button = items[0] as t.DevActionButton;
      expect(button.kind).to.eql('button');
      expect(button.handler).to.eql(fn);
    });

    it('config: "Unnamed"', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => null);

      const items = model.state.items;
      const button = items[0] as t.DevActionButton;
      expect(button.kind).to.eql('button');
      expect(button.label).to.eql('Unnamed');
    });

    it('config: "Unnamed" (via empty value)', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => config.label('hello').label('  '));

      const items = model.state.items;
      const button = items[0] as t.DevActionButton;
      expect(button.kind).to.eql('button');
      expect(button.label).to.eql('Unnamed');
    });

    it('config: description', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.button((config) => config.label('foo').description('   My description   '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.DevActionButton;
      expect(button.kind).to.eql('button');
      expect(button.description).to.eql('My description');
    });
  });

  describe('builder.boolean()', () => {
    it('label, handler', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.DevActionBooleanHandler<any> = () => true;
      const fn2: t.DevActionBooleanHandler<any> = () => false;
      builder
        .boolean('  foo  ', fn1)
        .boolean('bar', fn1)
        .boolean((config) => config.label('foo').handler(fn2).description('a thing'));

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const button1 = items[0] as t.DevActionBoolean;
      const button2 = items[1] as t.DevActionBoolean;
      const button3 = items[2] as t.DevActionBoolean;

      expect(button1.kind).to.eql('boolean');
      expect(button1.label).to.eql('foo');
      expect(button1.description).to.eql(undefined);
      expect(button1.handler).to.eql(fn1);

      expect(button2.kind).to.eql('boolean');
      expect(button2.label).to.eql('bar');
      expect(button2.description).to.eql(undefined);
      expect(button2.handler).to.eql(fn1);

      expect(button3.kind).to.eql('boolean');
      expect(button3.label).to.eql('foo');
      expect(button3.description).to.eql('a thing');
      expect(button3.handler).to.eql(fn2);
    });
  });

  describe('builder.select()', () => {
    it('label, handler', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.DevActionSelectHandler<any> = () => true;
      const fn2: t.DevActionSelectHandler<any> = () => false;
      builder
        .select('  foo  ', fn1)
        .select('bar', fn1)
        .select((config) =>
          config
            .label('foo')
            .items(['one', { label: 'two', value: 2 }])
            .multi(true)
            .clearable(true)
            .handler(fn2)
            .description('a thing'),
        );

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const select1 = items[0] as t.DevActionSelect;
      const select2 = items[1] as t.DevActionSelect;
      const select3 = items[2] as t.DevActionSelect;

      expect(select1.kind).to.eql('select');
      expect(select1.label).to.eql('foo');
      expect(select1.description).to.eql(undefined);
      expect(select1.items).to.eql([]);
      expect(select1.handler).to.eql(fn1);
      expect(select1.multi).to.eql(false);
      expect(select1.clearable).to.eql(false);

      expect(select2.kind).to.eql('select');
      expect(select2.label).to.eql('bar');
      expect(select2.description).to.eql(undefined);
      expect(select2.items).to.eql([]);
      expect(select2.handler).to.eql(fn1);
      expect(select2.multi).to.eql(false);
      expect(select2.clearable).to.eql(false);

      expect(select3.kind).to.eql('select');
      expect(select3.label).to.eql('foo');
      expect(select3.description).to.eql('a thing');
      expect(select3.items).to.eql(['one', { label: 'two', value: 2 }]);
      expect(select3.handler).to.eql(fn2);
      expect(select3.multi).to.eql(true);
      expect(select3.clearable).to.eql(true);
    });
  });

  describe('builder.hr()', () => {
    it('param: none', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.hr();

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.DevActionHr;
      expect(item.kind).to.eql('hr');
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

      const item = items[0] as t.DevActionHr;
      expect(item.kind).to.eql('hr');
      expect(item.height).to.eql(1);
      expect(item.opacity).to.eql(0.3);
    });

    it('params: number (height, opacity, margin)', () => {
      const { builder, model } = create();

      builder.hr().hr(3).hr(1, 0.2, [10, 20, 30, 40]);

      type H = t.DevActionHr;
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

      type H = t.DevActionHr;
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

      type H = t.DevActionHr;
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

      type H = t.DevActionHr;
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

      const item = items[0] as t.DevActionTitle;
      expect(item.kind).to.eql('title');
      expect(item.text).to.eql('Untitled');
    });

    it('string: "My Title"', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title('  My Title  ');

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.DevActionTitle;
      expect(item.kind).to.eql('title');
      expect(item.text).to.eql('My Title');
    });

    it('config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title((config) => config.text('  Hello  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.DevActionTitle;
      expect(item.kind).to.eql('title');
      expect(item.text).to.eql('Hello');
    });

    it('string, config', () => {
      const { builder, model } = create();
      expect(model.state.items).to.eql([]);

      builder.title('My Title', (config) => config.text('  Hello  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.DevActionTitle;
      expect(item.kind).to.eql('title');
      expect(item.text).to.eql('Hello');
    });
  });
});
