import * as React from 'react';

import { ActionsFactory } from '.';
import { ActionPanelProps } from '../../components/ActionPanel';
import { DevDefs, DisplayDefs } from '../../defs';
import { DEFAULT, expect, is, rx, StateObject, t, toObject } from '../../test';

type Ctx = { count: number };

function create() {
  type M = t.DevMethods<Ctx> & t.DisplayMethods<Ctx>;
  const defs = [...DevDefs, ...DisplayDefs];

  const model = ActionsFactory.model<Ctx>();
  const actions = ActionsFactory.compose<Ctx, M>(defs, model);
  const bus = rx.bus();
  return { model, actions, bus };
}

describe('ActionsFactory', () => {
  describe('ActionsFactory.model()', () => {
    it('model', () => {
      const model = ActionsFactory.model();
      expect(model.state).to.eql({ ...DEFAULT.ACTIONS });
    });
  });

  describe('ActionsFactory.compose()', () => {
    type M = t.ActionsModel<Ctx>;
    type A = t.ActionsChangeType;

    it('no defs', () => {
      const actions = ActionsFactory.compose([]);
      expect(actions.toDefs()).to.eql([]);
    });

    it('with defs', () => {
      const actions = ActionsFactory.compose<Ctx, M>(DisplayDefs);
      expect(actions.toDefs()).to.eql(DisplayDefs);
    });

    it('throw: duplicate method definitions', () => {
      const fn = () => ActionsFactory.compose<Ctx, M>([...DisplayDefs, ...DisplayDefs]);
      expect(fn).to.throw(/added more than once/);
    });

    it('no model', () => {
      const actions = ActionsFactory.compose([]);
      const obj = actions.toObject();
      expect(obj).to.eql({ ...DEFAULT.ACTIONS });
    });

    it('from {model} StateObject', () => {
      const model = StateObject.create<M, A>({ ...DEFAULT.ACTIONS });
      const actions = ActionsFactory.compose([], model);
      const obj = actions.toObject();
      expect(obj).to.eql({ ...DEFAULT.ACTIONS });
    });

    it('from {model} object', () => {
      const model = StateObject.create<M>({ ...DEFAULT.ACTIONS });
      const actions = ActionsFactory.compose([], model.state);
      const obj = actions.toObject();
      expect(obj).to.eql({ ...DEFAULT.ACTIONS });
    });

    it('from builder.toObject() - model state', () => {
      const base = ActionsFactory.compose([]).button('hello');
      const actions = ActionsFactory.compose([], base.toObject());
      const obj = actions.toObject();
      expect(obj).to.eql(base.toObject());
    });

    it('from builder.toModel() - model state', () => {
      const base = ActionsFactory.compose([]).button('hello');
      const actions = ActionsFactory.compose([], base.toObject());
      const model = actions.toModel();
      expect(model.state).to.eql(base.toObject());
      expect(model.change).to.be.an.instanceof(Function);
    });

    it('from builder.toEvents()', () => {
      const base = ActionsFactory.compose([]).button('hello');
      const actions = ActionsFactory.compose([], base.toObject());
      const obj = actions.toEvents();
      expect(is.observable(obj.$)).to.eql(true);
      expect(is.observable(obj.changed$)).to.eql(true);
    });
  });

  describe('actions.renderList()', () => {
    it('JSX element', () => {
      const { actions, model, bus } = create();
      const el = actions
        .context(() => ({ count: 123 }))
        .button('foo', () => null)
        .renderActionPanel(bus, { scrollable: false });

      expect(React.isValidElement(el)).to.eql(true);

      const props: ActionPanelProps = el.props;
      expect(props.actions.toObject().items).to.eql(model.state.items);
      expect(props.scrollable).to.eql(false);
      expect(props.bus).to.equal(bus);
    });

    it('throw: bus not provided', () => {
      const { actions } = create();
      const fn = () => actions.renderActionPanel({} as any);
      expect(fn).to.throw(/Event bus not provided/);
    });
  });

  describe('actions.renderSubject()', () => {
    it('factory not set (default values)', () => {
      const { actions } = create();
      const res = actions.context(() => ({ count: 1234 })).renderSubject();
      expect(res.items).to.eql([]);
      expect(res.layout).to.eql({});
    });

    it('passes context', () => {
      const { actions } = create();
      const ctx = { count: 123 };

      let fired: any = undefined;
      const res = actions
        .context(() => ctx)
        .subject((e) => (fired = toObject(e.ctx)))
        .renderSubject();

      expect(res.items).to.eql([]);
      expect(res.ctx).to.eql(ctx);
      expect(fired).to.eql(ctx);
    });

    it('single element', () => {
      const { actions, model } = create();
      const div = <div>Foo</div>;
      const res = actions
        .context(() => ({ count: 1234 }))
        .subject((e) => e.settings({ host: { orientation: 'y' } }).render(div))
        .renderSubject();

      expect(res.items.length).to.eql(1);
      expect(res.items[0].el).to.equal(div);
      expect(res.items[0].layout).to.eql(undefined);
      expect(model.state.env.viaSubject.host?.orientation).to.eql('y');
    });

    it('multiple elements (stack)', () => {
      const { actions, model } = create();
      const res = actions
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
      const { actions: builder } = create();
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
      const { actions, model } = create();
      const div = <div>Foo</div>;
      actions
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

  describe('actions.context()', () => {
    it('assign: .context(...)', () => {
      const { model, actions } = create();
      expect(model.state.ctx.get).to.eql(undefined);

      const fn1: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.ActionGetContext<Ctx> = () => ({ count: 456 });

      actions.context(fn1);
      expect(model.state.ctx.get).to.eql(fn1);

      // Replace with another context function.
      actions.context(fn2);
      expect(model.state.ctx.get).to.eql(fn2);
    });

    it('throw if factory function not provided', () => {
      const { actions } = create();
      const fn = () => actions.context('foo' as any);
      expect(fn).to.throw(/Context factory function not provided/);
    });
  });

  describe('actions.subject()', () => {
    it('stores root subject factory', () => {
      const { model, actions } = create();
      expect(model.state.renderSubject).to.eql(undefined);

      const fn1: t.ActionHandlerSubject<Ctx> = (e) => null;
      const fn2: t.ActionHandlerSubject<Ctx> = (e) => null;

      actions.subject(fn1);
      expect(model.state.renderSubject).to.eql(fn1);

      // Replace with another factory.
      actions.subject(fn2);
      expect(model.state.renderSubject).to.eql(fn2);
    });

    it('throw if factory function not provided', () => {
      const { actions } = create();
      const fn = () => actions.subject('foo' as any);
      expect(fn).to.throw(/Subject factory function not provided/);
    });
  });

  describe('actions.toContext()', () => {
    it('no factory: null', () => {
      const { actions } = create();
      expect(actions.toContext()).to.eql(null);
    });

    it('read property and store on model (prev)', () => {
      const { actions, model } = create();
      let count = 0;
      let prev: Ctx | null = null;
      actions.context((input) => {
        prev = input;
        return { count };
      });

      expect(actions.toContext()).to.eql({ count: 0 });
      expect(model.state.ctx.current).to.eql({ count: 0 });
      expect(prev).to.eql(null);

      count = 123;
      expect(actions.toContext()).to.eql({ count: 123 });
      expect(model.state.ctx.current).to.eql({ count: 123 });
      expect(prev).to.eql({ count: 0 });
    });
  });

  describe('actions.clone()', () => {
    it('same context', () => {
      const { actions } = create();
      const fn: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const clone = actions.context(fn).clone();
      expect(clone).to.not.equal(actions); // NB: Different instance.
      expect(clone.toObject().ctx.get).to.eql(fn);
    });

    it('different context', () => {
      const { actions } = create();
      const fn1: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.ActionGetContext<Ctx> = () => ({ count: 456 });
      const clone = actions.context(fn1).clone(fn2);
      expect(clone).to.not.equal(actions); // NB: Different instance.
      expect(clone.toObject().ctx.get).to.eql(fn2);
    });
  });

  describe('actions.merge()', () => {
    type Button = t.ActionButton;
    const labels = (actions: t.Actions<Ctx>) =>
      actions.toObject().items.map((btn) => (btn as Button).label);

    const one = create();
    const two = create();
    one.actions.button('one-a').button('one-b');
    two.actions.button('two-a').button('two-b');

    it('adds items to end (default)', () => {
      const builder1 = one.actions.clone();
      const builder2 = two.actions.clone();
      expect(labels(builder1)).to.eql(['one-a', 'one-b']);

      builder1.merge(builder2);
      expect(labels(builder1)).to.eql(['one-a', 'one-b', 'two-a', 'two-b']);
    });

    it('adds items to start', () => {
      const builder1 = one.actions.clone();
      const builder2 = two.actions.clone();
      expect(labels(builder1)).to.eql(['one-a', 'one-b']);

      builder1.merge(builder2, { insertAt: 'start' });
      expect(labels(builder1)).to.eql(['two-a', 'two-b', 'one-a', 'one-b']);
    });

    it('sets context-factory if not already set', () => {
      const builder1 = one.actions.clone();
      const builder2 = two.actions.clone();

      const fn: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      builder2.context(fn);

      builder1.merge(builder2);
      expect(builder1.toObject().ctx.get).to.eql(fn);
    });

    it('does not overwrite existing context factory', () => {
      const builder1 = one.actions.clone();
      const builder2 = two.actions.clone();

      const fn1: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.ActionGetContext<Ctx> = () => ({ count: 456 });
      builder1.context(fn1);
      builder2.context(fn2);

      builder1.merge(builder2);
      expect(builder1.toObject().ctx.get).to.eql(fn1);
    });

    it('is not effected by changes to merged in builder', () => {
      const builder1 = one.actions.clone();
      const builder2 = two.actions.clone();
      expect(labels(builder1)).to.eql(['one-a', 'one-b']);
      expect(labels(builder2)).to.eql(['two-a', 'two-b']);

      builder1.merge(builder2);
      expect(labels(builder1)).to.eql(['one-a', 'one-b', 'two-a', 'two-b']);

      builder2.button('two-c');
      expect(labels(builder1)).to.eql(['one-a', 'one-b', 'two-a', 'two-b']);
      expect(labels(builder2)).to.eql(['two-a', 'two-b', 'two-c']);
    });
  });

  describe('actions.namespace()', () => {
    it('change namespace', () => {
      const { actions, model } = create();
      expect(model.state.namespace).to.eql(DEFAULT.UNNAMED);

      actions.namespace('   Foobar  ');

      expect(model.state.namespace).to.eql('Foobar');

      actions.namespace('  ');
      expect(model.state.namespace).to.eql(DEFAULT.UNNAMED);

      actions.namespace('foo').namespace(undefined as any);
      expect(model.state.namespace).to.eql(DEFAULT.UNNAMED);
    });
  });

  describe('actions.items', () => {
    describe('button', () => {
      it('label, handler', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        const fn1: t.ActionButtonHandler<any> = () => null;
        const fn2: t.ActionButtonHandler<any> = () => null;
        actions.items((e) => {
          e.button('  foo  ', fn1).button('bar', fn1).button('foo', fn2);
        });

        const items = model.state.items;
        expect(items.length).to.eql(3);

        const button1 = items[0] as t.ActionButton;
        const button2 = items[1] as t.ActionButton;
        const button3 = items[2] as t.ActionButton;

        expect(button1.kind).to.eql('dev/button');
        expect(button1.label).to.eql('foo');
        expect(button1.handlers).to.eql([fn1]);

        expect(button2.kind).to.eql('dev/button');
        expect(button2.label).to.eql('bar');
        expect(button2.handlers).to.eql([fn1]);

        expect(button3.kind).to.eql('dev/button');
        expect(button3.label).to.eql('foo');
        expect(button3.handlers).to.eql([fn2]);
      });

      it('label (no handler)', () => {
        const { actions, model } = create();

        actions.items((e) => e.button('foo'));

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const button = items[0] as t.ActionButton;
        expect(button.label).to.eql('foo');
        expect(button.handlers).to.eql([]);
      });

      it('config', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        const fn: t.ActionButtonHandler<any> = () => null;
        actions.items((e) => e.button((config) => config.label('foo').pipe(fn)));

        const items = model.state.items;
        expect(items.length).to.eql(1);
        expect(items[0].kind).to.eql('dev/button');

        const button = items[0] as t.ActionButton;
        expect(button.kind).to.eql('dev/button');
        expect(button.handlers).to.eql([fn]);
      });

      it('config: "Unnamed"', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) => e.button((config) => null));

        const items = model.state.items;
        const button = items[0] as t.ActionButton;
        expect(button.kind).to.eql('dev/button');
        expect(button.label).to.eql('Unnamed');
      });

      it('config: "Unnamed" (via empty value)', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) => e.button((config) => config.label('hello').label('  ')));

        const items = model.state.items;
        const button = items[0] as t.ActionButton;
        expect(button.kind).to.eql('dev/button');
        expect(button.label).to.eql('Unnamed');
      });

      it('config: description', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) =>
          e.button((config) => config.label('foo').description('   My description   ')),
        );

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const button = items[0] as t.ActionButton;
        expect(button.kind).to.eql('dev/button');
        expect(button.description).to.eql('My description');
      });

      it('pipe multiple handlers', () => {
        const { actions, model } = create();

        const fn1: t.ActionButtonHandler<any> = () => null;
        const fn2: t.ActionButtonHandler<any> = () => null;

        actions.items((e) => e.button((config) => config.pipe(fn1, fn2, fn1)));

        const items = model.state.items;
        expect(items.length).to.eql(1);
        const button = items[0] as t.ActionButton;

        expect(button.handlers.length).to.eql(3);
        expect(button.handlers[0]).to.eql(fn1);
        expect(button.handlers[1]).to.eql(fn2);
        expect(button.handlers[2]).to.eql(fn1);
      });
    });

    describe('boolean', () => {
      it('label, handler', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        const fn1: t.ActionBooleanHandler<any> = () => true;
        const fn2: t.ActionBooleanHandler<any> = () => false;
        actions.items((e) => {
          e.boolean('  foo  ', fn1);
          e.boolean('bar', fn1);
          e.boolean((config) => config.label('foo').pipe(fn2).description('a thing'));
        });

        const items = model.state.items;
        expect(items.length).to.eql(3);

        const button1 = items[0] as t.ActionBoolean;
        const button2 = items[1] as t.ActionBoolean;
        const button3 = items[2] as t.ActionBoolean;

        expect(button1.kind).to.eql('dev/boolean');
        expect(button1.label).to.eql('foo');
        expect(button1.description).to.eql(undefined);
        expect(button1.handlers).to.eql([fn1]);

        expect(button2.kind).to.eql('dev/boolean');
        expect(button2.label).to.eql('bar');
        expect(button2.description).to.eql(undefined);
        expect(button2.handlers).to.eql([fn1]);

        expect(button3.kind).to.eql('dev/boolean');
        expect(button3.label).to.eql('foo');
        expect(button3.description).to.eql('a thing');
        expect(button3.handlers).to.eql([fn2]);
      });

      it('label (no handler)', () => {
        const { actions, model } = create();
        actions.items((e) => e.boolean('foo'));

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const button = items[0] as t.ActionBoolean;
        expect(button.label).to.eql('foo');
        expect(button.handlers).to.eql([]);
      });

      it('pipe multiple handlers', () => {
        const { actions, model } = create();

        const fn1: t.ActionBooleanHandler<any> = () => true;
        const fn2: t.ActionBooleanHandler<any> = () => false;

        actions.items((e) => e.boolean((config) => config.pipe(fn1, fn2, fn1)));

        const items = model.state.items;
        expect(items.length).to.eql(1);
        const button = items[0] as t.ActionBoolean;

        expect(button.handlers.length).to.eql(3);
        expect(button.handlers[0]).to.eql(fn1);
        expect(button.handlers[1]).to.eql(fn2);
        expect(button.handlers[2]).to.eql(fn1);
      });
    });

    describe('select', () => {
      it('label, handler', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        const fn1: t.ActionSelectHandler<any> = () => true;
        const fn2: t.ActionSelectHandler<any> = () => false;
        actions.items((e) => {
          e.select((config) => config.label('  foo  ').pipe(fn1));
          e.select((config) =>
            config
              .label('bar')
              .items(['one', { label: 'two', value: 2 }])
              .initial(2)
              .multi(true)
              .clearable(true)
              .pipe(fn2)
              .description('a thing'),
          );
        });

        const items = model.state.items;
        expect(items.length).to.eql(2);

        const select1 = items[0] as t.ActionSelect;
        const select2 = items[1] as t.ActionSelect;

        expect(select1.kind).to.eql('dev/select');
        expect(select1.label).to.eql('foo');
        expect(select1.description).to.eql(undefined);
        expect(select1.items).to.eql([]);
        expect(select1.initial).to.eql(undefined);
        expect(select1.handlers).to.eql([fn1]);
        expect(select1.multi).to.eql(false);
        expect(select1.clearable).to.eql(false);

        expect(select2.kind).to.eql('dev/select');
        expect(select2.label).to.eql('bar');
        expect(select2.description).to.eql('a thing');
        expect(select2.items).to.eql(['one', { label: 'two', value: 2 }]);
        expect(select2.initial).to.eql(2);
        expect(select2.handlers).to.eql([fn2]);
        expect(select2.multi).to.eql(true);
        expect(select2.clearable).to.eql(true);
      });

      it('label (no handler)', () => {
        const { actions, model } = create();

        actions.items((e) => e.select((config) => config.label('foo')));

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const button = items[0] as t.ActionSelect;
        expect(button.label).to.eql('foo');
        expect(button.handlers).to.eql([]);
      });

      it('pipe multiple handlers', () => {
        const { actions, model } = create();

        const fn1: t.ActionSelectHandler<any> = () => true;
        const fn2: t.ActionSelectHandler<any> = () => false;

        actions.items((e) => e.select((config) => config.pipe(fn1, fn2, fn1)));

        const items = model.state.items;
        expect(items.length).to.eql(1);
        const select = items[0] as t.ActionSelect;

        expect(select.handlers.length).to.eql(3);
        expect(select.handlers[0]).to.eql(fn1);
        expect(select.handlers[1]).to.eql(fn2);
        expect(select.handlers[2]).to.eql(fn1);
      });
    });

    describe('hr', () => {
      it('param: none', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) => e.hr());

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const item = items[0] as t.ActionHr;
        expect(item.kind).to.eql('display/hr');
        expect(item.height).to.eql(8);
        expect(item.opacity).to.eql(0.06);
        expect(item.margin).to.eql([8, 8]);
      });

      it('param: fn', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) => e.hr((config) => config.height(1).opacity(0.3)));

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const item = items[0] as t.ActionHr;
        expect(item.kind).to.eql('display/hr');
        expect(item.height).to.eql(1);
        expect(item.opacity).to.eql(0.3);
      });

      it('params: number (height, opacity, margin)', () => {
        const { actions, model } = create();

        actions.items((e) => e.hr().hr(3).hr(1, 0.2, [10, 20, 30, 40]));

        type H = t.ActionHr;
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
        const { actions, model } = create();
        actions.items((e) => e.hr().hr((config) => config.height(-1)));

        type H = t.ActionHr;
        const items = model.state.items;
        const item1 = items[0] as H;
        const item2 = items[1] as H;

        expect(item1.height).to.eql(8); // NB: default
        expect(item2.height).to.eql(0);
      });

      it('opacity: clamp 0..1', () => {
        const { actions, model } = create();

        actions.items((e) =>
          e
            .hr()
            .hr((config) => config.opacity(99))
            .hr((config) => config.opacity(-1)),
        );

        type H = t.ActionHr;
        const items = model.state.items;
        const item1 = items[0] as H;
        const item2 = items[1] as H;
        const item3 = items[2] as H;

        expect(item1.opacity).to.eql(0.06); // NB: default.
        expect(item2.opacity).to.eql(1);
        expect(item3.opacity).to.eql(0);
      });

      it('margin: 0', () => {
        const { actions, model } = create();
        actions.items((e) =>
          e
            .hr((config) => config.margin(1))
            .hr((config) => config.margin([5, 10]))
            .hr((config) => config.margin([1, 2, 3, 4])),
        );
        type H = t.ActionHr;
        const items = model.state.items;
        const item1 = items[0] as H;
        const item2 = items[1] as H;
        const item3 = items[2] as H;

        expect(item1.margin).to.eql(1); // NB: default
        expect(item2.margin).to.eql([5, 10]);
        expect(item3.margin).to.eql([1, 2, 3, 4]);
      });
    });

    describe('title', () => {
      it('string: Untitled', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) => e.title('  '));

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const item = items[0] as t.ActionTitle;
        expect(item.kind).to.eql('display/title');
        expect(item.text).to.eql('Untitled');
      });

      it('string: "My Title"', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) => e.title('  My Title  '));

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const item = items[0] as t.ActionTitle;
        expect(item.kind).to.eql('display/title');
        expect(item.text).to.eql('My Title');
      });

      it('config', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) => e.title((config) => config.text('  Hello  ')));

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const item = items[0] as t.ActionTitle;
        expect(item.kind).to.eql('display/title');
        expect(item.text).to.eql('Hello');
      });

      it('string, config', () => {
        const { actions, model } = create();
        expect(model.state.items).to.eql([]);

        actions.items((e) => e.title('My Title', (config) => config.text('  Hello  ')));

        const items = model.state.items;
        expect(items.length).to.eql(1);

        const item = items[0] as t.ActionTitle;
        expect(item.kind).to.eql('display/title');
        expect(item.text).to.eql('Hello');
      });
    });
  });
});
