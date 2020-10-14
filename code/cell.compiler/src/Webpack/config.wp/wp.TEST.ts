import { Webpack } from '..';
import { fs, expect, ModuleFederationPlugin } from '../../test';
import { wp } from '.';

const create = () => {
  const model = Webpack.config.model('foo');
  const builder = Webpack.config.create(model);
  return { model, builder };
};

describe('wp.toWebpackConfig', () => {
  it('"production"', () => {
    const { builder } = create();
    const config = builder;
    const res = wp.toWebpackConfig(config);

    expect(res.mode).to.eql('production');
    expect(res.output?.publicPath).to.eql('http://localhost:3000/');
    expect(res.devServer).to.eql(undefined);
    expect(res.devtool).to.eql(undefined);
  });

  it('"development" (and other custom values)', () => {
    const { builder } = create();
    const config = builder.url('localhost:1234').mode('dev');
    const res = wp.toWebpackConfig(config);

    expect(res.mode).to.eql('development');
    expect(res.output?.publicPath).to.eql('http://localhost:1234/');
    expect(res.devServer?.port).to.eql(1234);
  });

  it('publicPath (localhost)', () => {
    const { builder } = create();
    const config = builder.url('localhost:1234');
    const res = wp.toWebpackConfig(config);
    expect(res.output?.publicPath).to.eql('http://localhost:1234/');
  });

  it('publicPath (domain)', () => {
    const { builder } = create();

    const config1 = wp.toWebpackConfig(builder.url('foo.com:80'));
    const config2 = wp.toWebpackConfig(builder.url('foo.com:1234'));

    expect(config1.output?.publicPath).to.eql('https://foo.com/');
    expect(config2.output?.publicPath).to.eql('https://foo.com:1234/');
  });

  it('name', () => {
    const { builder } = create();
    expect(wp.toWebpackConfig(builder).name).to.eql('foo');

    builder.name('home');
    expect(wp.toWebpackConfig(builder).name).to.eql('home');
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
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(undefined);

    builder.dir('foo');
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(fs.resolve('foo'));

    builder.dir('  ');
    expect(wp.toWebpackConfig(builder).output?.path).to.eql(undefined);
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
