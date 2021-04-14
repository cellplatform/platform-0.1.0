import * as React from 'react';

import { ActionsFactory } from '.';
import { ActionPanelProps } from '../../components/ActionPanel';
import { DevDefs, DisplayDefs } from '../../defs';
import { DEFAULT, expect, is, rx, StateObject, t, toObject } from '../../test';

type Ctx = { count: number };

export function create() {
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
      const model = StateObject.create<M>({ ...DEFAULT.ACTIONS });
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
      const base = ActionsFactory.compose([]); //.items((e) => e.button('hello'));
      const actions = ActionsFactory.compose([], base.toObject());
      const obj = actions.toObject();
      expect(obj).to.eql(base.toObject());
    });

    it('from builder.toModel() - model state', () => {
      const base = ActionsFactory.compose([]); //.items((e) => e.button('hello'));
      const actions = ActionsFactory.compose([], base.toObject());
      const model = actions.toModel();
      expect(model.state).to.eql(base.toObject());
      expect(model.change).to.be.an.instanceof(Function);
    });

    it('from builder.toEvents()', () => {
      const base = ActionsFactory.compose([]); //.items((e) => e.button('hello'));
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
        .items((e) => e.button('foo', () => null))
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
    it('stores/replaces subject factory', () => {
      const { model, actions } = create();
      expect(model.state.subject).to.eql(undefined);

      const fn1: t.ActionHandlerSubject<Ctx> = (e) => null;
      const fn2: t.ActionHandlerSubject<Ctx> = (e) => null;

      actions.subject(fn1);
      expect(model.state.subject).to.eql(fn1);

      // Replace with another factory.
      actions.subject(fn2);
      expect(model.state.subject).to.eql(fn2);
    });

    it('throw if factory function not provided', () => {
      const { actions } = create();
      const fn = () => actions.subject('foo' as any);
      expect(fn).to.throw(/Subject factory function not provided/);
    });
  });

  describe('actions.controller()', () => {
    it('stores/replaces controller factory', () => {
      const { model, actions } = create();
      expect(model.state.subject).to.eql(undefined);

      const fn1: t.ActionHandlerController<Ctx> = (e) => null;
      const fn2: t.ActionHandlerController<Ctx> = (e) => null;

      actions.controller(fn1);
      expect(model.state.controller).to.eql(fn1);

      // Replace with another factory.
      actions.controller(fn2);
      expect(model.state.controller).to.eql(fn2);
    });

    it('throw if factory function not provided', () => {
      const { actions } = create();
      const fn = () => actions.controller('foo' as any);
      expect(fn).to.throw(/Controller factory function not provided/);
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
      let prev: Ctx | undefined;
      actions.context((e) => {
        prev = e.prev;
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
    one.actions.items((e) => e.button('one-a').button('one-b'));
    two.actions.items((e) => e.button('two-a').button('two-b'));

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

      builder2.items((e) => e.button('two-c'));
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
});
