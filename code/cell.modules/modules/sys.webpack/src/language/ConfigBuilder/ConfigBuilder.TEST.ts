import { expect, t, rx, DEFAULT, StateObject } from '../../test';
import { ConfigBuilder } from '.';
// import * as ConfigBuilder from '.';
// import { Webpack } from '../..';

const create = () => {
  const bus = rx.bus();
  const model = ConfigBuilder.model();
  const builder = ConfigBuilder.create(bus, model);
  return { bus, model, builder };
};

describe.only('ConfigBuilder', () => {
  describe('create', () => {
    it('model', () => {
      const model = ConfigBuilder.model();
      expect(model.state).to.eql(DEFAULT.CONFIG);
    });

    it('builder', () => {
      const bus = rx.bus();
      const builder = ConfigBuilder.create(bus);
      expect(builder.toObject()).to.eql(DEFAULT.CONFIG);
    });

    it('builder (with model)', () => {
      const bus = rx.bus();
      const model = StateObject.create<t.WebpackModel>({ ...DEFAULT.CONFIG, mode: 'development' });
      const builder = ConfigBuilder.create(bus, model);
      expect(builder.toObject().mode).to.eql('development');
    });
  });

  describe('props', () => {
    it('mode', () => {
      const { model, builder } = create();
      const test = (input: any, expected: t.WebpackMode) => {
        builder.mode(input);
        expect(model.state.mode).to.eql(expected);
      };

      test(undefined, 'production');
      test('', 'production');
      test('  ', 'production');
      test({}, 'production');
      test(123, 'production');

      test('production', 'production');
      test(' production  ', 'production');
      test('prod', 'production');
      test(' prod ', 'production');

      test('development', 'development');
      test(' dev ', 'development');
    });
  });

  describe('output', () => {
    it('toObject', () => {
      const { model, builder } = create();
      expect(builder.mode('dev').toObject()).to.eql(model.state);
    });
  });
});
