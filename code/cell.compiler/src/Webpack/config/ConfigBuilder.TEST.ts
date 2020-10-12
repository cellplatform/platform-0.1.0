import { ConfigBuilder } from '.';
import {
  DEFAULT,
  expect,
  StateObject,
  t,
  ModuleFederationPlugin,
  escapeKeyPaths,
} from '../../test';

const pkg = require('../../../package.json') as t.INpmPackageJson; // eslint-disable-line

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
      const test = (input: any, expected: t.WpMode) => {
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

    it('host', () => {
      const { builder, model } = create();
      const DEFAULT_HOST = DEFAULT.CONFIG.host;
      expect(builder.toObject().host).to.eql(DEFAULT_HOST);

      const test = (value: any, expected: string | undefined) => {
        builder.host(value);
        expect(model.state.host).to.eql(expected);
      };

      test('https://a.foo.com', 'https://a.foo.com');
      test('https://foo.com/', 'https://foo.com');
      test('foo.com', 'https://foo.com');
      test('foo.com', 'https://foo.com');
      test('localhost', 'http://localhost');
      test('localhost///', 'http://localhost');
      test('http://localhost', 'http://localhost');
      test(undefined, DEFAULT_HOST);
      test('   ', DEFAULT_HOST);
    });

    it('target', () => {
      const { model, builder } = create();
      expect(model.state.target).to.eql(['web']);

      const test = (input: any, expected: any) => {
        builder.target(input);
        expect(model.state.target).to.eql(expected);
      };

      test(false, false);
      test(undefined, undefined);
      test('  web  ', ['web']);
      test(['web  '], ['web']);
      test(['web', '  node'], ['web', 'node']);
      test(['webworker', false], ['webworker']);
      test('  ', undefined);
      test(null, undefined);
      test({}, undefined);
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

  describe('entry', () => {
    it('throw: no key', () => {
      const { builder } = create();
      const fn = () => builder.entry('  ', 'foo');
      expect(fn).to.throw(/Entry field 'key' required/);
    });

    it('add: key, path', () => {
      const { builder, model } = create();
      builder.entry(' main ', ' src/index.tsx ');
      builder.entry('foo', 'src/foo.tsx');
      builder.entry('bar', '  ');
      expect(model.state.entry?.main).to.eql('src/index.tsx'); // NB: trims paths.
      expect(model.state.entry?.foo).to.eql('src/foo.tsx');
      expect(model.state.entry?.bar).to.eql(undefined);
    });

    it('add: path only (default "main" key)', () => {
      const { builder, model } = create();
      builder.entry(' src/foo.tsx ');
      expect(model.state.entry?.main).to.eql('src/foo.tsx');
    });

    it('remove', () => {
      const { builder, model } = create();

      builder.entry('main', 'src/main.tsx');
      builder.entry('foo', 'src/foo.tsx');
      expect(model.state.entry).to.eql({ main: 'src/main.tsx', foo: 'src/foo.tsx' });

      builder.entry('main', '  '); // NB: trims paths to empty: remove inferred from empty string.
      expect(model.state.entry).to.eql({ foo: 'src/foo.tsx' });

      builder.entry('foo', null); // NB: null indicates explicit removal
      expect(model.state.entry).to.eql(undefined);
    });
  });

  describe('exposes', () => {
    it('throw: no key', () => {
      const { builder } = create();
      const fn = () => builder.expose('  ', 'foo');
      expect(fn).to.throw(/Entry field 'key' required/);
    });

    it('add', () => {
      const { builder, model } = create();
      builder.expose(' Header ', ' src/Header.tsx ');
      expect(model.state.exposes?.Header).to.eql('src/Header.tsx');
    });

    it('escapes key', () => {
      const { builder, model } = create();
      builder.expose('foo/bar', 'src/Header.tsx');
      expect(Object.keys(model.state.exposes || {})).to.include('foo\\bar');
    });

    it('remove', () => {
      const { builder, model } = create();

      builder.expose(' main ', ' src/main.tsx ');
      builder.expose('foo', 'src/foo.tsx');
      expect(model.state.exposes).to.eql({ main: 'src/main.tsx', foo: 'src/foo.tsx' });

      builder.expose('main', '');
      expect(model.state.exposes).to.eql({ foo: 'src/foo.tsx' });

      builder.expose('foo', null);
      expect(model.state.exposes).to.eql(undefined);
    });
  });

  describe('remotes', () => {
    it('throw: no key', () => {
      const { builder } = create();
      const fn = () => builder.remote('  ', 'foo');
      expect(fn).to.throw(/Entry field 'key' required/);
    });

    it('add', () => {
      const { builder, model } = create();
      const path = 'nav@http://localhost:3001/remoteEntry.js';
      builder.remote(' my-nav ', ` ${path} `);
      expect((model.state.remotes || {})['my-nav']).to.eql(path);
    });

    it('escapes key', () => {
      const { builder, model } = create();
      builder.remote('foo/bar', 'nav@http://localhost:3001/remoteEntry.js');
      expect(Object.keys(model.state.remotes || {})).to.include('foo\\bar');
    });

    it('remove', () => {
      const { builder, model } = create();

      builder.remote(' main ', ' main@localhost:3001/remote.js ');
      builder.remote('foo', 'foo@localhost:3001/remote.js');
      expect(model.state.remotes).to.eql({
        main: 'main@localhost:3001/remote.js',
        foo: 'foo@localhost:3001/remote.js',
      });

      builder.remote('main', '');
      expect(model.state.remotes).to.eql({ foo: 'foo@localhost:3001/remote.js' });

      builder.remote('foo', null);
      expect(model.state.remotes).to.eql(undefined);
    });
  });

  describe('shared', () => {
    it('throw: no function', () => {
      const { builder } = create();
      const fn = () => builder.shared(undefined as any);
      expect(fn).to.throw(/function setter parameter required/);
    });

    it('loads {dependencies} from package.json', () => {
      const { builder } = create();
      let args: t.WebpackBuilderShared | undefined;
      builder.shared((e) => (args = e));
      expect(args?.cwd).to.eql(process.cwd());
      expect(args?.deps).to.eql(pkg.dependencies);
    });

    it('adds {dependencies} object (cumulative)', () => {
      const { builder, model } = create();

      const escaped = escapeKeyPaths(pkg.dependencies || {});

      builder.shared((args) => args.add(args.deps));
      expect(model.state.shared).to.eql(escaped);

      builder.shared((args) => args.add({ foo: '1.2.3' }).add({ bar: '0.0.0' }));
      expect(model.state.shared).to.eql({ ...escaped, foo: '1.2.3', bar: '0.0.0' });
    });

    it('adds dependency by name(s)', () => {
      const { builder, model } = create();
      const deps = pkg.dependencies || {};

      builder.shared((args) => args.add('foobar')); // NB: Does not exist in [package.json] dependencies.
      expect(model.state.shared).to.eql({});

      builder.shared((args) => args.add('@platform/libs'));
      expect(model.state.shared).to.eql({ '@platform\\libs': deps['@platform/libs'] }); // NB: key escaped.

      builder.shared((args) => args.add(['@platform/log', 'ts-loader']));
      expect(model.state.shared).to.eql({
        '@platform\\libs': deps['@platform/libs'],
        '@platform\\log': deps['@platform/log'],
        'ts-loader': deps['ts-loader'],
      });
    });

    it('overwrites as singleton', () => {
      const { builder, model } = create();
      const deps = pkg.dependencies || {};

      builder.shared((args) => args.add(args.deps).singleton('@platform/libs'));

      expect((model.state.shared || {})['@platform\\libs']).to.eql({
        singleton: true,
        requiredVersion: deps['@platform/libs'],
      });

      builder.shared((args) => args.singleton(['@platform/cell.types', 'ts-loader']));

      expect((model.state.shared || {})['@platform\\cell.types']).to.eql({
        singleton: true,
        requiredVersion: deps['@platform/cell.types'],
      });

      expect((model.state.shared || {})['ts-loader']).to.eql({
        singleton: true,
        requiredVersion: deps['ts-loader'],
      });
    });
  });

  describe('toWebpack', () => {
    it('"production"', () => {
      const { builder } = create();
      const config = builder;
      const res = config.toWebpack();

      expect(res.mode).to.eql('production');
      expect(res.output?.publicPath).to.eql('http://localhost:3000/');
      expect(res.devServer).to.eql(undefined);
      expect(res.devtool).to.eql(undefined);
    });

    it('"development" (and other custom values)', () => {
      const { builder } = create();
      const config = builder.port(1234).mode('dev');
      const res = config.toWebpack();

      expect(res.mode).to.eql('development');
      expect(res.output?.publicPath).to.eql('http://localhost:1234/');
      expect(res.devServer?.port).to.eql(1234);
    });

    it('host (localhost)', () => {
      const { builder } = create();
      const config = builder.host('   ').port(1234);
      const res = config.toWebpack();
      expect(res.output?.publicPath).to.eql('http://localhost:1234/');
    });

    it('host (domain)', () => {
      const { builder } = create();

      const config1 = builder.host('foo.com').port(80).toWebpack();
      const config2 = builder.host('foo.com').port(1234).toWebpack();

      expect(config1.output?.publicPath).to.eql('https://foo.com/');
      expect(config2.output?.publicPath).to.eql('https://foo.com:1234/');
    });

    it('target', () => {
      const { builder } = create();
      expect(builder.toWebpack().target).to.eql(['web']);

      builder.target('web');
      expect(builder.toWebpack().target).to.eql(['web']);

      builder.target(['web', 'node12.18']);
      expect(builder.toWebpack().target).to.eql(['web', 'node12.18']);
    });

    describe('ModuleFederationPlugin', () => {
      it('un-escapes keys in: exposes/remotes/shared', () => {
        const { builder } = create();
        const config = builder
          .shared((args) => args.add('@platform/libs'))
          .remote('foo/bar', 'path')
          .expose('foo/bar', 'path');
        const res = config.toWebpack();

        const mf = (res.plugins || []).find((item) => item instanceof ModuleFederationPlugin);
        expect(mf).to.not.eql(undefined);

        const options = mf?._options || {};
        expect(Object.keys(options.remotes || {})).to.include('foo/bar');
        expect(Object.keys(options.exposes || {})).to.include('foo/bar');
        expect(Object.keys(options.shared || {})).to.include('@platform/libs');
      });
    });
  });
});
