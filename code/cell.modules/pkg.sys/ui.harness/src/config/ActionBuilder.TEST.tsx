import { expect, DEFAULT, StateObject, t } from '../test';
import { ActionBuilder } from '.';

const create = () => {
  const model = ActionBuilder.model('foo');
  const builder = ActionBuilder.builder(model);
  return { model, builder };
};

describe('ActionBuilder', () => {
  describe('create: .model()', () => {
    it('model', () => {
      const model = ActionBuilder.model('  foo  ');
      expect(model.state).to.eql({ ...DEFAULT.ACTIONS, name: 'foo' });
    });

    it('throw: unnamed', () => {
      const test = (name: any) => {
        const fn = () => ActionBuilder.model(name);
        expect(fn).to.throw(/must be named/);
      };
      test('');
      test('  ');
      test(undefined);
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

    it('from builder.toObject()', () => {
      const base = ActionBuilder.builder('base');
      const builder = ActionBuilder.builder(base.toObject());
      expect(builder.toObject()).to.eql(base.toObject());
    });
  });
});
