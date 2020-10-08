import { expect, t, DEFAULT, StateObject } from '../test';
import { ConfigBuilder } from '.';

const create = () => {
  const model = ConfigBuilder.model('foo');
  const builder = ConfigBuilder.create(model);
  return { model, builder };
};

describe('ConfigBuilder', () => {
  describe('create', () => {
    it('model', () => {
      const model = ConfigBuilder.model('  foo  ');
      expect(model.state).to.eql({ ...DEFAULT.CONFIG, name: 'foo' });
    });

    it('builder (with "name")', () => {
      const builder = ConfigBuilder.create('  foo  ');
      expect(builder.toObject()).to.eql({ ...DEFAULT.CONFIG, name: 'foo' });
    });

    it('builder (with model)', () => {
      const model = StateObject.create<t.WebpackModel>({
        ...DEFAULT.CONFIG,
        name: 'foo',
        mode: 'development',
      });
      const builder = ConfigBuilder.create(model);

      const obj = builder.toObject();
      expect(obj.name).to.eql('foo');
      expect(obj.mode).to.eql('development');
    });

    it('throw: unnamed', () => {
      const test = (name: any) => {
        const fn = () => ConfigBuilder.create(name);
        expect(fn).to.throw(/must be named/);
      };
      test('');
      test('  ');
      test(undefined);
    });

    it('clone', () => {
      const { builder } = create();
      const clone = builder.clone();
      expect(clone.toObject()).to.eql(builder.toObject());

      builder.title('A');
      clone.title('B');

      expect(builder.toObject().title).to.eql('A');
      expect(clone.toObject().title).to.eql('B');
    });
  });

  describe('props', () => {
    it('name', () => {
      const { model, builder } = create();
      expect(model.state.name).to.eql('foo');

      const test = (input: any, expected: any) => {
        builder.name(input);
        expect(model.state.name).to.eql(expected);
      };

      test('hello', 'hello');
      test(' hello ', 'hello');
    });

    it('name: throw (empty)', () => {
      const test = (input: any) => {
        const { builder } = create();
        const fn = () => builder.name(input);
        expect(fn).to.throw(/must be named/);
      };

      test('');
      test('  ');
      test(null);
      test({});
    });

    it('title', () => {
      const { model, builder } = create();
      expect(model.state.title).to.eql(undefined);

      const test = (input: any, expected: any) => {
        builder.title(input);
        expect(model.state.title).to.eql(expected);
      };

      test('foo', 'foo');
      test(' foo ', 'foo');
      test('', undefined);
      test('  ', undefined);
      test(null, undefined);
      test({}, undefined);
    });

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

    it('lint', () => {
      const { builder, model } = create();
      expect(builder.toObject().lint).to.eql(undefined);

      const test = (value: any, expected: boolean | undefined) => {
        builder.lint(value);
        expect(model.state.lint).to.eql(expected);
      };

      test(true, true);
      test(false, false);
      test(undefined, undefined);
      test({}, undefined);
    });
  });

  describe.only('entry', () => {
    it('throw: no key', () => {
      const { builder } = create();
      const fn = () => builder.entry('  ', 'foo');
      expect(fn).to.throw(/Entry field 'key' required/);
    });

    it('add entry', () => {
      const { builder, model } = create();
      builder.entry(' main ', ' src/foo.tsx ');
      expect(model.state.entry?.main).to.eql('src/foo.tsx');
    });

    it('remove entry', () => {
      const { builder, model } = create();

      builder.entry(' main ', ' src/main.tsx ');
      builder.entry('foo', 'src/foo.tsx');
      expect(model.state.entry).to.eql({ main: 'src/main.tsx', foo: 'src/foo.tsx' });

      builder.entry('main', '');
      expect(model.state.entry).to.eql({ foo: 'src/foo.tsx' });

      builder.entry('foo', null);
      expect(model.state.entry).to.eql(undefined);
    });
  });
});
