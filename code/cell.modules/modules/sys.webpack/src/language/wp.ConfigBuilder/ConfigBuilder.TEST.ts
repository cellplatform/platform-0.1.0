import { expect, rx, t } from '../../test';
import * as ConfigBuilder from '.';
import { Webpack } from '../..';
import { DEFAULT } from './DEFAULT';

const props = (m: t.WebpackModule) => m.state.props as t.WebpackProps;
const data = (m: t.WebpackModule) => props(m).data as t.WebpackData;
const configAt = (m: t.WebpackModule, key: string) => data(m).configs[key];

const create = () => {
  const bus = rx.bus();
  const module = Webpack.module(bus);
  const builder = ConfigBuilder.factory(bus, module);
  return { bus, module, builder };
};

describe('Webpack: ConfigBuilder', () => {
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
      expect(data(module)).to.eql(DEFAULT.DATA);
      builder.name('foo');

      const config = configAt(module, 'foo');
      expect(config).to.eql({ ...DEFAULT.CONFIG, name: 'foo' });
    });

    it('toObject', () => {
      const { module, builder } = create();

      expect(builder.toObject()).to.eql({});

      const config = builder
        .name('foo')
        .mode('development')
        .devTool('eval-cheap-module-source-map');

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

  describe('config', () => {
    it(':parent', () => {
      const { builder, module } = create();
      expect(builder.name('foo').parent()).to.equal(builder);
    });

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

    it('context', () => {
      const { module, builder } = create();
      const foo = builder.name('foo');
      expect(configAt(module, 'foo').context).to.eql(undefined);

      foo.context('/path');
      expect(configAt(module, 'foo').context).to.eql('/path');

      foo.context('');
      expect(configAt(module, 'foo').context).to.eql(undefined);
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
      const test = (input: any, expected: t._WebpackConfigData['devTool']) => {
        builder.name('foo').devTool(input);
        expect(configAt(module, 'foo').devTool).to.eql(expected);
      };

      test(undefined, undefined);
      test('  ', undefined);
      test('', undefined);
      test(false, undefined);

      test(' eval-source-map ', 'eval-source-map');
    });
  });

  describe('config.output', () => {
    it(':parent', () => {
      const { builder } = create();
      expect(builder.name('foo').output.parent().parent()).to.equal(builder);
    });

    it('filename', () => {
      const { builder, module } = create();
      const foo = builder.name('foo');
      expect(configAt(module, 'foo').output).to.eql(undefined);

      foo.output.filename('bundle.js');
      expect(configAt(module, 'foo').output?.filename).to.eql('bundle.js');

      foo.output.filename('  ');
      expect(configAt(module, 'foo').output?.filename).to.eql(undefined);
    });

    it('path', () => {
      const { builder, module } = create();
      const foo = builder.name('foo');
      expect(configAt(module, 'foo').output).to.eql(undefined);

      foo.output.path('/path');
      expect(configAt(module, 'foo').output?.path).to.eql('/path');

      foo.output.path('  ');
      expect(configAt(module, 'foo').output?.path).to.eql(undefined);
    });

    it('publicPath', () => {
      const { builder, module } = create();
      const foo = builder.name('foo');
      expect(configAt(module, 'foo').output).to.eql(undefined);

      const cdn = 'https://cdn.example.com/assets/[hash]/';
      foo.output.publicPath(cdn);
      expect(configAt(module, 'foo').output?.publicPath).to.eql(cdn);

      foo.output.publicPath('  ');
      expect(configAt(module, 'foo').output?.publicPath).to.eql(undefined);
    });
  });

  describe('config.resolve', () => {
    it(':parent', () => {
      const { builder } = create();
      expect(builder.name('foo').resolve.parent().parent()).to.equal(builder);
    });

    it('extensions', () => {
      const { builder, module } = create();
      const foo = builder.name('foo');
      expect(configAt(module, 'foo').resolve).to.eql(undefined);

      const test = (value: any, expected: string[] | undefined) => {
        foo.resolve.extensions(value);
        expect(configAt(module, 'foo').resolve?.extensions).to.eql(expected);
      };

      test([], undefined);
      test(['.tsx', '.ts', '.jsx', '.js', '.json'], ['.tsx', '.ts', '.jsx', '.js', '.json']);
      test(['', undefined, '  '], undefined);
      test(['.tsx', undefined, '  '], ['.tsx']);
      test(undefined, undefined);
      test([' tsx ', 'ts  ', ' json'], ['.tsx', '.ts', '.json']);
    });
  });

  describe('config.devServer', () => {
    it(':parent', () => {
      const { builder } = create();
      expect(builder.name('foo').resolve.parent().parent()).to.equal(builder);
    });

    it('port', () => {
      const { builder, module } = create();
      const foo = builder.name('foo');
      expect(configAt(module, 'foo').resolve).to.eql(undefined);

      const test = (value: any, expected: number | undefined) => {
        foo.devServer.port(value);
        expect(configAt(module, 'foo').devServer?.port).to.eql(expected);
      };

      test(1234, 1234);
      test(undefined, undefined);
    });
  });
});
