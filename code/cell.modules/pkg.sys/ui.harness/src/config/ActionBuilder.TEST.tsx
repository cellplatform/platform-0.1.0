import { expect, DEFAULT, StateObject, t } from '../test';
import { ActionBuilder } from '.';
import { ActionPanel } from '../components/ActionPanel';

type Ctx = { count: number };

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
      const model = StateObject.create<t.ActionModel>({
        ...DEFAULT.ACTIONS,
        name: 'foo',
      });
      const builder = ActionBuilder.builder(model);

      const obj = builder.toObject();
      expect(obj.name).to.eql('foo');
    });

    it('from {model} object', () => {
      const model = StateObject.create<t.ActionModel>({
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
      const input = StateObject.create<t.ActionModel>(DEFAULT.ACTIONS);
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
      expect(model.state.name).to.eql(DEFAULT.ACTIONS.name);
    });

    it('context', () => {
      const { model, builder } = create();
      expect(model.state.getContext).to.eql(undefined);

      const getContext: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      builder.context(getContext);
      expect(model.state.getContext).to.eql(getContext);
    });

    it('context: throw if function not provided', () => {
      const { builder } = create();
      const fn = () => builder.context('foo' as any);
      expect(fn).to.throw(/Context factory function not provided/);
    });

    it('clone: same context', () => {
      const { builder } = create();
      const fn: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const clone = builder.context(fn).clone();
      expect(clone).to.not.equal(builder); // NB: Different instance.
      expect(clone.toObject().getContext).to.eql(fn);
    });

    it('clone: different context', () => {
      const { builder } = create();
      const fn1: t.ActionGetContext<Ctx> = () => ({ count: 123 });
      const fn2: t.ActionGetContext<Ctx> = () => ({ count: 456 });
      const clone = builder.context(fn1).clone(fn2);
      expect(clone).to.not.equal(builder); // NB: Different instance.
      expect(clone.toObject().getContext).to.eql(fn2);
    });
  });
});
