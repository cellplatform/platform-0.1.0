import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Compiler } from '..';
import { fs, expect, ModuleFederationPlugin, t, Encoding } from '../../test';
import { ConfigBuilder } from '../Config';
import { wp } from '.';

const create = (name = 'foo') => {
  const model = ConfigBuilder.model(name);
  const builder = Compiler.config(model).namespace('sys.foo');
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

  it('namespace', () => {
    const { builder } = create();

    const options = (builder: t.CompilerModelBuilder) => {
      const config = wp.toWebpackConfig(builder);
      const mf = (config.plugins || []).find((plugin) => plugin instanceof ModuleFederationPlugin);
      return mf._options;
    };

    builder.namespace('  foobar ');
    expect(options(builder).name).to.eql('foobar');

    builder.namespace('foo.bar');
    expect(options(builder).name).to.eql(Encoding.escapeNamespace('foo.bar'));
  });

  it('namespace: throw (namespace not set)', () => {
    const builder = Compiler.config();
    expect(builder.toObject().namespace).to.eql(undefined);

    const fn = () => wp.toWebpackConfig(builder);
    expect(fn).to.throw(/requires a "namespace" \(scope\)/);
  });

  it('target', () => {
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).target).to.eql('web');

    builder.target('web');
    expect(wp.toWebpackConfig(builder).target).to.eql('web');

    builder.target('node12.18');
    expect(wp.toWebpackConfig(builder).target).to.eql('node12.18');
  });

  it('output dir', () => {
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('dist/web'));

    builder.outdir('foo');
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('foo/web'));

    builder.outdir('  '); // NB: reset.
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('dist/web'));

    builder.target('node');
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('dist/node'));

    builder.outdir('foo');
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('foo/node'));
  });

  it('webpack.rules', () => {
    const rule = { test: /\.ttf$/, use: ['file-loader'] };
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).module?.rules).to.not.include(rule);

    builder.webpack((config) => config.rule(rule));
    expect(wp.toWebpackConfig(builder).module?.rules).to.include(rule);
  });

  it('webpack.plugins', () => {
    const plugin = { foo: 123 };
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).plugins).to.not.include(plugin);

    builder.webpack((config) => config.plugin(plugin));
    expect(wp.toWebpackConfig(builder).plugins).to.include(plugin);
  });

  describe('HtmlWebpackPlugin', () => {
    const getHtmlPlugin = (builder: t.CompilerModelBuilder) => {
      const plugins = wp.toWebpackConfig(builder).plugins || [];
      const plugin = plugins.find((plugin) => plugin instanceof HtmlWebpackPlugin);
      return plugin?.userOptions;
    };

    it('html.inject', () => {
      const { builder } = create();
      const plugin = () => getHtmlPlugin(builder);
      expect(plugin().inject).to.eql(true);

      builder.html((config) => config.inject(false));
      expect(plugin().inject).to.eql(false);

      builder.html((config) => config.inject(true).inject(undefined));
      expect(plugin().inject).to.eql(true);
    });
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
