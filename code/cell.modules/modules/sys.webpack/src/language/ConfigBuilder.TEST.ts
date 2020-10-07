import { expect, t, DEFAULT, StateObject } from '../test';
import { ConfigBuilder } from '.';

const create = () => {
  const model = ConfigBuilder.model();
  const builder = ConfigBuilder.create(model);
  return { model, builder };
};

describe('ConfigBuilder', () => {
  describe('create', () => {
    it('model', () => {
      const model = ConfigBuilder.model();
      expect(model.state).to.eql(DEFAULT.CONFIG);
    });

    it('builder', () => {
      const builder = ConfigBuilder.create();
      expect(builder.toObject()).to.eql(DEFAULT.CONFIG);
    });

    it('builder (with model)', () => {
      const model = StateObject.create<t.WebpackModel>({ ...DEFAULT.CONFIG, mode: 'development' });
      const builder = ConfigBuilder.create(model);
      expect(builder.toObject().mode).to.eql('development');
    });

    it('toModel', () => {
      const { model, builder } = create();
      expect(builder.mode('dev').toObject()).to.eql(model.state);
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

    it('port', () => {
      const { builder, model } = create();
      const DEFAULT_PORT = DEFAULT.CONFIG.port;
      expect(builder.toObject().port).to.eql(DEFAULT_PORT);

      const test = (value: any, expected: number | undefined) => {
        builder.port(value);
        expect(model.state.port).to.eql(expected);
      };

      test(1234, 1234);
      test(undefined, DEFAULT_PORT);
    });
  });
});
