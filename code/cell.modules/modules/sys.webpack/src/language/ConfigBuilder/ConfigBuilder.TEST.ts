import { expect, rx, t, constants } from '../../test';
import { Webpack } from '../..';

const props = (m: t.WebpackModule) => m.state.props as t.WebpackProps;
const data = (m: t.WebpackModule) => props(m).data as t.WebpackData;
const configAt = (m: t.WebpackModule, key: string) => data(m).config[key];

const create = () => {
  const bus = rx.bus();
  const module = Webpack.module(bus);
  const builder = Webpack.builder.config(bus, module);
  return { bus, module, builder };
};

describe.only('Webpack: ConfigBuilder', () => {
  describe('create', () => {
    it('by "name"', () => {
      const { module, builder } = create();
      const dev = builder.name('dev');
      expect(builder.name('dev')).to.equal(dev); // NB: Same instance.
      expect(configAt(module, 'dev').name).to.eql('dev'); // NB: Name auto assigned.
    });

    it('distinct values', () => {
      const { module, builder } = create();
      builder.name('one');
      builder.name('two').name('two-b');

      expect(configAt(module, 'one').name).to.eql('one');
      expect(configAt(module, 'two').name).to.eql('two-b');
    });

    it('default values', () => {
      const { module, builder } = create();
      expect(data(module)).to.eql(constants.DEFAULT.DATA);
      builder.name('foo');

      const config = configAt(module, 'foo');
      expect(config).to.eql({ ...constants.DEFAULT.CONFIG, name: 'foo' });
    });

    it('toObject', () => {
      const { module, builder } = create();

      expect(builder.toObject()).to.eql({});

      const config = builder
        .name('foo')
        .mode('development')
        .devtool('eval-cheap-module-source-map');

      expect(config.toObject()).to.eql(configAt(module, 'foo'));
      expect(config.toObject()).to.equal(config.toObject());

      expect(builder.toObject()).to.eql({ foo: config.toObject() });
    });
  });

  describe('clone', () => {
    it('cloned instance', () => {
      const { module, builder } = create();

      const foo = builder.name('foo');
      const bar = foo.clone('bar');

      expect(configAt(module, 'foo').mode).to.eql('production');
      expect(configAt(module, 'bar').mode).to.eql('production');

      bar.mode('dev');
      expect(configAt(module, 'foo').mode).to.eql('production');
      expect(configAt(module, 'bar').mode).to.eql('development');
    });

    it('throw: name already exists', () => {
      const { builder } = create();
      const fn = () => builder.name('foo').clone('foo');
      expect(fn).to.throw(/already in use/);
    });
  });

  describe('config (props)', () => {
    it('name', () => {
      const { module, builder } = create();
      const foo = builder.name('dev');
      expect(configAt(module, 'dev').name).to.eql('dev');

      foo.name('hello');
      expect(configAt(module, 'dev').name).to.eql('hello');

      foo.name('boo').name('  zoo  ');
      expect(configAt(module, 'dev').name).to.eql('zoo'); // NB: trimmed.

      const zoo = foo.name('zoo');
      expect(zoo).to.not.eql(undefined);
      expect(zoo).to.eql(foo.name('zoo'));
    });

    it('mode', () => {
      const { module, builder } = create();
      const test = (input: any, expected: t.WebpackMode) => {
        builder.name('foo').mode(input);
        expect(configAt(module, 'foo').mode).to.eql(expected);
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

    it('mode: throw', () => {
      const { builder } = create();
      const fn = () => builder.name('foo').mode('foo' as any);
      expect(fn).to.throw(/Invalid mode/);
    });

    it('devtool', () => {
      const { module, builder } = create();
      const test = (input: any, expected: t.WebpackConfigData['devTool']) => {
        builder.name('foo').devtool(input);
        expect(configAt(module, 'foo').devTool).to.eql(expected);
      };

      test(undefined, undefined);
      test('  ', undefined);
      test('', undefined);
      test(false, undefined);

      test(' eval-source-map ', 'eval-source-map');

      // builder.
    });
  });
});
