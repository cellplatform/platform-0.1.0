import { Compiler } from '..';
import { fs, expect, ModuleFederationPlugin, t, encoding } from '../../test';
import { ConfigBuilder } from '../Config';
import { wp } from '.';

const create = (name = 'foo') => {
  const model = ConfigBuilder.model(name);
  const builder = Compiler.config(model).scope('sys.foo');
  return { model, builder };
};

describe('Compiler (Webpack)', () => {
  it('"production"', () => {
    const { builder } = create();
    const config = builder;
    const res = wp.toWebpackConfig(config);

    expect(res.mode).to.eql('production');
    expect(res.output?.publicPath).to.eql('auto');
    expect(res.devServer).to.eql(undefined);
    expect(res.devtool).to.eql(undefined);
  });

  it('"development" (and other custom values)', () => {
    const { builder } = create();
    const config = builder.port(1234).mode('dev');
    const res = wp.toWebpackConfig(config);

    expect(res.mode).to.eql('development');
    expect(res.output?.publicPath).to.eql('auto');
    expect(res.devServer?.port).to.eql(1234);
  });

  it('publicPath: "auto"', () => {
    const { builder } = create();
    const res = wp.toWebpackConfig(builder);
    expect(res.output?.publicPath).to.eql('auto');
  });

  it('name', () => {
    const { builder } = create('foobar');
    expect(wp.toWebpackConfig(builder).name).to.eql('foobar');
  });

  it('scope', () => {
    const { builder } = create();

    const options = (builder: t.CompilerModelBuilder) => {
      const config = wp.toWebpackConfig(builder);
      const mf = (config.plugins || []).find((plugin) => plugin instanceof ModuleFederationPlugin);
      return mf._options;
    };

    builder.scope('  foobar ');
    expect(options(builder).name).to.eql('foobar');

    builder.scope('foo.bar');
    expect(options(builder).name).to.eql(encoding.escapeScope('foo.bar'));
  });

  it('scope: throw (scope not set)', () => {
    const builder = Compiler.config();
    expect(builder.toObject().scope).to.eql(undefined);

    const fn = () => wp.toWebpackConfig(builder);
    expect(fn).to.throw(/requires a \"scope\"/);
  });

  it('target', () => {
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).target).to.eql(['web']);

    builder.target('web');
    expect(wp.toWebpackConfig(builder).target).to.eql(['web']);

    builder.target(['web', 'node12.18']);
    expect(wp.toWebpackConfig(builder).target).to.eql(['web', 'node12.18']);
  });

  it('output dir', () => {
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('dist/web'));

    builder.dir('foo');
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('foo/web'));

    builder.dir('  '); // NB: reset.
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('dist/web'));

    builder.target('node');
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('dist/node'));

    builder.target(['node', 'web']);
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('dist/node,web'));

    builder.dir('foo');
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('foo/node,web'));
  });

  it('rules', () => {
    const rule = { test: /\.ttf$/, use: ['file-loader'] };
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).module?.rules).to.not.include(rule);

    builder.webpack.rule(rule);
    expect(wp.toWebpackConfig(builder).module?.rules).to.include(rule);
  });

  it('plugins', () => {
    const plugin = { foo: 123 };
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).plugins).to.not.include(plugin);

    builder.webpack.plugin(plugin);
    expect(wp.toWebpackConfig(builder).plugins).to.include(plugin);
  });

  describe('ModuleFederationPlugin', () => {
    it('un-escapes keys in: exposes/remotes/shared', () => {
      const { builder } = create();
      const config = builder
        .shared((args) => args.add('@platform/libs'))
        .remote('foo/bar', 'path')
        .expose('foo/bar', 'path');
      const res = wp.toWebpackConfig(config);

      const mf = (res.plugins || []).find((item) => item instanceof ModuleFederationPlugin);
      expect(mf).to.not.eql(undefined);

      const options = mf?._options || {};
      expect(Object.keys(options.remotes || {})).to.include('foo/bar');
      expect(Object.keys(options.exposes || {})).to.include('foo/bar');
      expect(Object.keys(options.shared || {})).to.include('@platform/libs');
    });
  });
});
