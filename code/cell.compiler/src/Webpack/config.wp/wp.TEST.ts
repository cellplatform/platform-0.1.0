import { Webpack } from '..';
import { expect, ModuleFederationPlugin } from '../../test';
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
    const config = builder.port(1234).mode('dev');
    const res = wp.toWebpackConfig(config);

    expect(res.mode).to.eql('development');
    expect(res.output?.publicPath).to.eql('http://localhost:1234/');
    expect(res.devServer?.port).to.eql(1234);
  });

  it('host (localhost)', () => {
    const { builder } = create();
    const config = builder.host('   ').port(1234);
    const res = wp.toWebpackConfig(config);
    expect(res.output?.publicPath).to.eql('http://localhost:1234/');
  });

  it('host (domain)', () => {
    const { builder } = create();

    const config1 = wp.toWebpackConfig(builder.host('foo.com').port(80));
    const config2 = wp.toWebpackConfig(builder.host('foo.com').port(1234));

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
