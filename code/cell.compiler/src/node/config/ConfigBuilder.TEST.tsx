import * as React from 'react';

import { ConfigBuilder } from '.';
import { DEFAULT, Encoding, expect, fs, pkg, StateObject, t } from '../../test';

const create = () => {
  const model = ConfigBuilder.model('foo');
  const builder = ConfigBuilder.builder(model);
  return { model, builder };
};

describe('Compiler (Config)', () => {
  describe('create: .model()', () => {
    it('model', () => {
      const model = ConfigBuilder.model('  foo  ');
      expect(model.state).to.eql({ ...DEFAULT.CONFIG, name: 'foo' });
    });

    it('throw: unnamed', () => {
      const test = (name: any) => {
        const fn = () => ConfigBuilder.model(name);
        expect(fn).to.throw(/must be named/);
      };
      test('');
      test('  ');
      test(undefined);
    });
  });

  describe('create: .builder()', () => {
    it('from no params', () => {
      const builder = ConfigBuilder.builder();
      expect(builder.toObject()).to.eql({ ...DEFAULT.CONFIG, name: DEFAULT.BASE });
    });

    it('from "name"', () => {
      const builder = ConfigBuilder.builder('  foo  ');
      expect(builder.toObject()).to.eql({ ...DEFAULT.CONFIG, name: 'foo' });
    });

    it('from {model} StateObject', () => {
      const model = StateObject.create<t.CompilerModel>({
        ...DEFAULT.CONFIG,
        name: 'foo',
        mode: 'development',
      });
      const builder = ConfigBuilder.builder(model);

      const obj = builder.toObject();
      expect(obj.name).to.eql('foo');
      expect(obj.mode).to.eql('development');
    });

    it('from {model} object', () => {
      const model = StateObject.create<t.CompilerModel>({
        ...DEFAULT.CONFIG,
        name: 'foo',
        mode: 'development',
      });

      const builder = ConfigBuilder.builder(model.state);

      const obj = builder.toObject();
      expect(obj.mode).to.eql('development');
      expect(obj.name).to.eql('foo');
    });

    it('from builder.toObject()', () => {
      const base = ConfigBuilder.builder('base');
      const builder = ConfigBuilder.builder(base.toObject());
      expect(builder.toObject()).to.eql(base.toObject());
    });
  });

  describe('variant', () => {
    it('create', () => {
      const base = ConfigBuilder.builder('name');
      expect(base.toObject().variants).to.eql(undefined);

      let prod: t.CompilerModelBuilder | undefined;
      base.variant('prod', (config) => {
        prod = config;
        config.title('My Prod');
      });

      expect(base.toObject().title).to.eql(undefined);
      expect(prod?.toObject().title).to.eql('My Prod');
      expect(prod?.toObject().name).to.eql('prod');

      const variants = base.toObject().variants || [];
      expect(variants.length).to.eql(1);
      expect(variants.map((b) => b.name())).to.eql(['prod']);
      expect(variants.map((b) => b.toObject().title)).to.eql(['My Prod']);
    });

    it('parent', () => {
      const base = ConfigBuilder.builder('name');
      expect(base.toObject().parent()).to.eql(undefined);

      let prod: t.CompilerModelBuilder | undefined;
      base.variant('prod', (config) => (prod = config));
      expect(prod?.toObject().parent()).to.eql(base.toObject());
    });

    it('modify existing variant', () => {
      const base = ConfigBuilder.builder('name');

      base.variant('prod', (config) => config.title('prod-1a'));
      base.variant('prod', (config) => config.title('prod-1b'));
      base.variant('  prod  ', (config) => config.title('prod-2'));
      base.variant('dev', (config) => config.title('dev-1'));

      const variants = base.toObject().variants || [];
      expect(variants.length).to.eql(2);

      expect(variants[0].toObject().title).to.eql('prod-2');
      expect(variants[1].toObject().title).to.eql('dev-1');
    });

    it('find', () => {
      const base = ConfigBuilder.builder('base').title('root');

      base.variant('prod', (config) => config.title('myProd'));
      base.variant('dev', (config) => config.title('myDev'));

      expect(base.find('NO_EXIST')).to.eql(null);

      expect(base.find('prod')?.name()).to.eql('prod');
      expect(base.find('   prod   ')?.name()).to.eql('prod');
      expect(base.find('dev')?.name()).to.eql('dev');

      expect(base.find('prod')?.toObject().title).to.eql('myProd');
      expect(base.find('dev')?.toObject().title).to.eql('myDev');
    });

    it('throw: no name', () => {
      const base = ConfigBuilder.builder('base');
      const fn = () => base.variant('  ', () => null);
      expect(fn).to.throw(/Variant name not provided/);
    });

    it('throw: no handler', () => {
      const base = ConfigBuilder.builder('base');
      const fn = () => base.variant('prod', undefined as any);
      expect(fn).to.throw(/Variant configuration builder not provided/);
    });
  });

  describe('hooks', () => {
    it('beforeCompile', () => {
      const { builder, model } = create();
      expect(model.state.beforeCompile).to.equal(undefined);

      const handler: t.BeforeCompile = (e) => null;
      builder.beforeCompile(handler).beforeCompile(handler);

      expect(model.state.beforeCompile).to.include(handler);
      expect((model.state.beforeCompile || []).length).to.eql(2);
    });

    it('afterCompile', () => {
      const { builder, model } = create();
      expect(model.state.afterCompile).to.equal(undefined);

      const handler: t.AfterCompile = (e) => null;
      builder.afterCompile(handler).afterCompile(handler);

      expect(model.state.afterCompile).to.include(handler);
      expect((model.state.afterCompile || []).length).to.eql(2);
    });
  });

  describe('read', () => {
    it('name', () => {
      const { model, builder } = create();
      expect(model.state.name).to.eql('foo');
      expect(builder.name()).to.eql('foo');
    });

    it('clone', () => {
      const { builder } = create();
      const clone = builder.clone();
      expect(clone.toObject()).to.eql(builder.toObject());

      builder.title('A');
      clone.title('B');

      // NB: variations to clone do not change source.
      expect(builder.toObject().title).to.eql('A');
      expect(clone.toObject().title).to.eql('B');
    });

    it('clone({ props })', () => {
      const { builder } = create();
      const clone = builder.clone({ name: 'thing' });
      expect(clone.name()).to.eql('thing');
    });

    it('toWebpack', () => {
      const { builder } = create();
      const config = builder
        .port(1234)
        .mode('dev')
        .namespace('foo.bar')
        .beforeCompile((e) => e.modifyWebpack((webpack) => (webpack.target = undefined)));

      const webpack = config.toWebpack();

      expect(webpack.mode).to.eql('development');
      expect(webpack.output?.publicPath).to.eql('auto');
      expect(webpack.devServer?.port).to.eql(1234);
      expect(webpack.target).to.eql(undefined);
    });
  });

  describe('write', () => {
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

    it('namesapce ("scope")', () => {
      const { model, builder } = create();
      expect(model.state.namespace).to.eql(undefined);

      const test = (input: any, expected: any) => {
        builder.namespace(input);
        expect(model.state.namespace).to.eql(expected);
      };

      test('foo', 'foo');
      test(' foo ', 'foo');
      test('foo1', 'foo1');
      test('foo_bar', 'foo_bar');
      test('foo.bar', 'foo.bar');
      test('.foo', '.foo');
      test('  _foo  ', '_foo');
    });

    it('scope: throw (invalid namespace)', () => {
      const { builder } = create();

      const test = (input: any) => {
        const fn = () => builder.namespace(input);
        expect(fn).to.throw(/Invalid namespace/);
      };

      test('');
      test('foo-bar');
      test('foo/bar');
      test('foo?');
      test('1Foo');
      test(' 1Foo');

      test('');
      test('  ');
      test(null);
      test({});
    });

    it('version', () => {
      const { model, builder } = create();
      expect(model.state.version).to.eql(undefined);

      const test = (input: any, expected: any) => {
        builder.version(input);
        expect(model.state.version).to.eql(expected);
      };

      test('0.0.0', '0.0.0');
      test('  1.2.3  ', '1.2.3');
      test('  ~1.2.3  ', '1.2.3');
      test('  =v1.2.3  ', '1.2.3');
      test('  =v2  ', '2.0.0');
      test('  =v2.1  ', '2.1.0');

      test(undefined, undefined);
      test(null, undefined);
      test('', undefined);
      test('  ', undefined);
    });

    it('version: throw (invalid semver)', () => {
      const { builder } = create();

      const test = (input: any) => {
        const fn = () => builder.version(input);
        expect(fn).to.throw(/Invalid version/);
      };

      test('abc');
      test('-');
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
      const PORT = DEFAULT.CONFIG.port;
      expect(builder.toObject().port).to.eql(PORT);

      const test = (value: any, expected: any) => {
        builder.port(value);
        expect(model.state.port).to.eql(expected);
      };

      test(1234, 1234);
      test(undefined, PORT);
    });

    it('target', () => {
      const { model, builder } = create();
      expect(model.state.target).to.eql('web');

      const test = (input: any, expected: any) => {
        builder.target(input);
        expect(model.state.target).to.eql(expected);
      };

      test(false, undefined);
      test(undefined, undefined);
      test('  web  ', 'web');
      test('  node', 'node');
      test('  ', undefined);
      test(null, undefined);
      test({}, undefined);
    });

    it('outdir', () => {
      const { model, builder } = create();
      expect(model.state.outdir).to.eql('dist');

      const test = (input: any, expected: any) => {
        builder.outdir(input);
        expect(model.state.outdir).to.eql(expected);
      };

      test('foo', fs.resolve('foo'));
      test(' foo ', fs.resolve('foo'));
      test('', undefined);
      test('  ', undefined);
      test(null, undefined);
      test({}, undefined);
    });

    it('static', () => {
      const test = (input: string | null, expected: any) => {
        const { model, builder } = create();
        expect(model.state.static).to.eql(undefined);
        builder.static(input);
        expect(model.state.static).to.eql(expected);
      };

      test('foo', [{ dir: fs.resolve('foo') }]);
      test('  ./static  ', [{ dir: fs.resolve('static') }]);

      test('', undefined);
      test('  ', undefined);
      test(null, undefined);
      test({} as any, undefined);
    });

    it('static (additive)', () => {
      const resolve = fs.resolve;
      const { model, builder } = create();
      expect(model.state.static).to.eql(undefined);

      builder.static('static');
      builder.static('static');

      expect(model.state.static).to.eql([{ dir: resolve('static') }]);

      builder.static('foo/bar');
      expect(model.state.static).to.eql([{ dir: resolve('static') }, { dir: resolve('foo/bar') }]);

      builder.static(null);
      expect(model.state.static).to.eql(undefined);
    });

    it('declarations ([.d.ts] files)', () => {
      const { model, builder } = create();
      expect(model.state.static).to.eql(undefined);

      type D = t.CompilerModelDeclarations;

      const test = (include: string, dir: string | undefined, expected: D[]) => {
        builder.declarations(include, dir);
        expect(model.state.declarations).to.eql(expected);
      };

      const reset = () => builder.declarations(null);
      const src = 'src/**/*';

      test(src, '  types.d/foo  ', [{ include: src, dir: 'foo' }]);

      reset();
      expect(model.state.declarations).to.eql(undefined);

      test(src, '  foo  ', [{ include: src, dir: 'foo' }]);
      reset();

      test(src, 'foo/bar/baz', [{ include: src, dir: 'foo/bar/baz' }]);
      reset();

      test(src, '//dir/bar///', [{ include: src, dir: 'dir/bar' }]);
      reset();

      // Default directory: "main"
      test(src, '   ', [{ include: src, dir: 'main' }]);
      reset();

      test(src, undefined, [{ include: src, dir: 'main' }]);
      reset();
    });

    it('declarations: de-duped "include" array)', () => {
      const src = 'src/**/*';

      const { model, builder } = create();
      builder.declarations(src, 'types.d/foo');
      builder.declarations('foo/**/*', 'foo');
      builder.declarations(src, 'types.d/foo');
      expect(model.state.declarations).to.eql([
        {
          include: [src, 'foo/**/*'], // NB: Stacked into "include" array on the dir, and de-duped.
          dir: 'foo',
        },
      ]);
    });

    it('declarations: default directory named "main"', () => {
      const { builder, model } = create();
      const reset = () => builder.declarations(null);
      const test = (dir?: string) => {
        builder.declarations('src/**/*', dir);
        expect(model.state.declarations).to.eql([{ include: 'src/**/*', dir: 'main' }]);
        reset();
      };

      test();
      test('');
      test('  ');
      test('types.d');
      test('  types.d  ');
      test('  //types.d//  ');
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

    it('env', () => {
      const { builder, model } = create();
      expect(model.state.env).to.eql(undefined);

      builder.env({ foo: '123' }).env({ bar: [456] });
      expect(model.state.env).to.eql({ foo: '123', bar: [456] });

      builder.env(null);
      expect(model.state.env).to.eql(undefined);

      builder.env({ foo: 123 }).env({ foo: 456 });
      expect(model.state.env).to.eql({ foo: 456 });
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

    it('add: {map}', () => {
      const { builder, model } = create();
      builder.entry({ foo: ' src/foo.tsx ', bar: 'src/bar.ts' });

      expect(model.state.entry?.foo).to.eql('src/foo.tsx');
      expect(model.state.entry?.bar).to.eql('src/bar.ts');
    });

    it('replace: {map}', () => {
      const { builder, model } = create();
      builder.entry({ one: '1.ts ', two: '2.ts' });
      expect(model.state.entry).to.eql({ one: '1.ts', two: '2.ts' });

      builder.entry({ three: '    3.ts    ', four: '4.ts' });
      expect(model.state.entry).to.eql({ three: '3.ts', four: '4.ts' });
    });

    it('remove: via null/undefined', () => {
      const { builder, model } = create();

      builder.entry('main', 'src/main.tsx').entry('foo', 'src/foo.tsx');
      expect(model.state.entry).to.eql({ main: 'src/main.tsx', foo: 'src/foo.tsx' });

      builder.entry('foo', null).entry('main', null); // NB: null indicates explicit removal
      expect(model.state.entry).to.eql(undefined);
    });

    it('remove: via empty string', () => {
      const { builder, model } = create();

      builder.entry('main', 'src/main.tsx').entry('foo', 'src/foo.tsx');
      expect(model.state.entry).to.eql({ main: 'src/main.tsx', foo: 'src/foo.tsx' });

      builder.entry('main', '  '); // NB: trims paths to empty: remove inferred from empty string.
      expect(model.state.entry).to.eql({ foo: 'src/foo.tsx' });
    });

    it('clear: empty object ({})', () => {
      const { builder, model } = create();
      builder.entry({ one: '1.ts ', two: '2.ts' });
      expect(model.state.entry).to.eql({ one: '1.ts', two: '2.ts' });

      builder.entry({});
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
      const path = 'nav@http://localhost:3001/entry.remote.js';
      builder.remote(' my-nav ', ` ${path} `);
      expect((model.state.remotes || {})['my-nav']).to.eql(path);
    });

    it('escapes key', () => {
      const { builder, model } = create();
      builder.remote('foo/bar', 'nav@http://localhost:3001/entry.remote.js');
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
    it('loads {dependencies} from package.json', () => {
      const { builder } = create();
      let args: t.CompilerConfigShared | undefined;
      builder.shared((e) => (args = e));
      expect(args?.cwd).to.eql(process.cwd());
      expect(args?.dependencies).to.eql(pkg.dependencies);
      expect(args?.devDependencies).to.eql(pkg.devDependencies);
    });

    it('adds {dependencies} object (cumulative)', () => {
      const { builder, model } = create();

      const escaped = Encoding.transformKeys(pkg.dependencies || {}, Encoding.escapePath);

      builder.shared((args) => args.add(args.dependencies));
      expect(model.state.shared).to.eql(escaped);

      builder.shared((args) => args.add({ foo: '1.2.3' }).add({ bar: '0.0.0' }));
      expect(model.state.shared).to.eql({ ...escaped, foo: '1.2.3', bar: '0.0.0' });
    });

    it('adds dependency by name(s)', () => {
      const { builder, model } = create();
      const deps = pkg.dependencies || {};
      const devDeps = pkg.devDependencies || {};

      expect(model.state.shared).to.eql(undefined);

      builder.shared((args) => args.add('@platform/libs'));
      expect(model.state.shared).to.eql({ '@platform\\libs': deps['@platform/libs'] }); // NB: key escaped.

      builder.shared((args) => args.add(['@platform/log', 'babel-loader', '@platform/react']));
      expect(model.state.shared).to.eql({
        '@platform\\libs': deps['@platform/libs'],
        '@platform\\log': deps['@platform/log'],
        'babel-loader': deps['babel-loader'],
        '@platform\\react': devDeps['@platform/react'],
      });
    });

    it('overwrites as singleton', () => {
      const { builder, model } = create();
      const deps = pkg.dependencies || {};

      builder.shared((args) => args.add(args.dependencies).singleton('@platform/libs'));

      expect((model.state.shared || {})['@platform\\libs']).to.eql({
        singleton: true,
        requiredVersion: deps['@platform/libs'],
      });

      builder.shared((args) => args.singleton(['@platform/cell.types', 'babel-loader']));

      expect((model.state.shared || {})['@platform\\cell.types']).to.eql({
        singleton: true,
        requiredVersion: deps['@platform/cell.types'],
      });

      expect((model.state.shared || {})['babel-loader']).to.eql({
        singleton: true,
        requiredVersion: deps['babel-loader'],
      });
    });

    it('throw: no function', () => {
      const { builder } = create();
      const fn = () => builder.shared(undefined as any);
      expect(fn).to.throw(/function setter parameter required/);
    });

    it('throw: does not exist in package.json', () => {
      const { builder } = create();
      const fn = () => builder.shared((args) => args.add('DERP'));
      expect(fn).to.throw(/does not exist/);
    });
  });

  describe('webpack', () => {
    it('add rule', () => {
      const { builder, model } = create();
      const rule = { test: /\.ttf$/, use: ['file-loader'] };

      builder.webpack((config) => config.rule(rule));
      expect(model.state.webpack?.rules).to.include(rule);

      builder.webpack((config) => config.rule(rule).rule(rule));
      expect((model.state.webpack?.rules || []).length).to.eql(3);
    });

    it('adds plugin', () => {
      const { builder, model } = create();
      const plugin = { foo: 123 };

      builder.webpack((config) => config.plugin(plugin));
      expect(model.state.webpack?.plugins).to.include(plugin);

      builder.webpack((config) => config.plugin(plugin).plugin(plugin));
      expect((model.state.webpack?.plugins || []).length).to.eql(3);
    });
  });

  describe('html', () => {
    it('throw: handler not provided', () => {
      const { builder } = create();
      const fn = () => builder.html(null as any);
      expect(fn).to.throw(/Html builder function not provided/);
    });

    it('inject', () => {
      const { builder, model } = create();
      expect(model.state.html).to.eql(undefined);

      builder.html((config) => config.inject(true));
      expect(model.state.html?.inject).to.eql(true);

      builder.html((config) => config.inject(false));
      expect(model.state.html?.inject).to.eql(false);

      builder.html((config) => config.inject(false).inject(true).inject(undefined));
      expect(model.state.html?.inject).to.eql(undefined);
    });

    it('head', () => {
      const { builder, model } = create();
      expect(model.state.html).to.eql(undefined);

      builder.html((config) =>
        config.head(
          <head>
            <title>Foobar</title>
          </head>,
        ),
      );
      expect(React.isValidElement(model.state.html?.head)).to.eql(true);

      builder.html((config) => config.head(undefined));
      expect(model.state.html?.head).to.eql(undefined);
    });

    it('body', () => {
      const { builder, model } = create();
      expect(model.state.html).to.eql(undefined);

      builder.html((config) =>
        config.body(
          <body>
            <div id={'foo'}>Loading...</div>
          </body>,
        ),
      );
      expect(React.isValidElement(model.state.html?.body)).to.eql(true);

      builder.html((config) => config.body(undefined));
      expect(model.state.html?.body).to.eql(undefined);
    });
  });

  describe('files', () => {
    it('throw: handler not provided', () => {
      const { builder } = create();
      const fn = () => builder.files(null as any);
      expect(fn).to.throw(/Files builder function not provided/);
    });

    describe('files.redirect', () => {
      it('resets (with [undefined])', () => {
        const { builder, model } = create();
        expect(builder.toObject().files?.redirects).to.eql(undefined);

        builder.files((files) => files.redirect('ALLOW', '  worker.js  '));
        expect(model.state.files?.redirects).to.eql([{ action: 'ALLOW', grep: 'worker.js' }]);

        builder.files((files) => files.redirect(undefined));
        expect(builder.toObject().files?.redirects).to.eql(undefined);
      });

      it('cumulatively adds', () => {
        const { builder, model } = create();
        expect(builder.toObject().files?.redirects).to.eql(undefined);

        builder.files((files) => {
          files.redirect('DENY', 'foo.js').redirect('ALLOW', 'hello.js');
        });

        expect(model.state.files?.redirects).to.eql([
          { action: 'ALLOW', grep: 'hello.js' }, // NB: Allow before DENY.
          { action: 'DENY', grep: 'foo.js' },
        ]);
      });

      it('ordering/sorting: ALLOW before DENY', () => {
        const { builder, model } = create();
        expect(builder.toObject().files?.redirects).to.eql(undefined);

        builder.files((files) => {
          files
            .redirect(undefined)
            .redirect('ALLOW', '   ')
            .redirect('DENY', 'foo.js')
            .redirect('ALLOW', 'hello.js')
            .redirect('ALLOW', undefined)
            .redirect('ALLOW', ' foo.js ') // NB: The later entry overrides the earlier value.
            .redirect('DENY', ''); // NB: The later entry overrides the earlier value.
        });

        expect(model.state.files?.redirects).to.eql([
          { action: 'ALLOW', grep: 'hello.js' }, //  NB: Allow before DENY.
          { action: 'ALLOW', grep: 'foo.js' }, //    NB: "foo.js" entires collapsed
          { action: 'DENY', grep: undefined }, //    NB: multiple [undefined/empty] entries collapsed.
        ]);
      });

      it('input permutations', () => {
        const test = (
          grant: any,
          grep: string | undefined,
          expected: t.CompilerModelRedirect[] | undefined,
        ) => {
          const { builder, model } = create();
          builder.files((files) => files.redirect(grant, grep));
          expect(model.state.files?.redirects).to.eql(expected);
        };

        test('ALLOW', 'worker.js', [{ action: 'ALLOW', grep: 'worker.js' }]);
        test('ALLOW', ' worker.js ', [{ action: 'ALLOW', grep: 'worker.js' }]);
        test('DENY', 'worker.js', [{ action: 'DENY', grep: 'worker.js' }]);
        test(true, 'worker.js', [{ action: 'ALLOW', grep: 'worker.js' }]);
        test(false, 'worker.js', [{ action: 'DENY', grep: 'worker.js' }]);
        test(undefined, 'worker.js', [{ action: undefined, grep: 'worker.js' }]);
        test('DENY', 'foo/**', [{ action: 'DENY', grep: 'foo/**' }]);
      });

      it('throw: invalid grant', () => {
        const { builder } = create();
        const test = (input: any, err: RegExp) => {
          const fn = () => builder.files((files) => files.redirect(input));
          expect(fn).to.throw(err);
        };

        test('FOO', /Invalid grant action \'FOO\'/);
        test(123, /Invalid grant action \'123\'/);
      });
    });

    describe('files.access', () => {
      it('undefined (empty)', () => {
        const { model } = create();
        expect(model.state.files?.access).to.eql(undefined);
      });

      it('public', () => {
        const { builder, model } = create();
        expect(model.state.files?.access).to.eql(undefined);
        builder.files((config) => config.access('public', 'src/**/*.png'));
        expect(model.state.files?.access).to.eql([{ permission: 'public', grep: 'src/**/*.png' }]);
      });
    });
  });
});
