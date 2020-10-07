import { ConfigBuilder } from '../language';
import { expect } from '../test';
import { toWebpackConfig } from './wp';

const create = () => {
  const model = ConfigBuilder.model('foo');
  const builder = ConfigBuilder.create(model);
  return { model, builder };
};

describe('Compiler', function () {
  describe('toWebpackConfig', () => {
    it('"production"', () => {
      const { builder } = create();
      const config = builder;
      const res = toWebpackConfig(config);

      expect(res.mode).to.eql('production');
      expect(res.output?.publicPath).to.eql('http://localhost:3000/');
      expect(res.devServer).to.eql(undefined);
      expect(res.devtool).to.eql(undefined);
    });

    it('"development" (and other custom values)', () => {
      const { builder } = create();
      const config = builder.port(1234).mode('dev');
      const res = toWebpackConfig(config);

      expect(res.mode).to.eql('development');
      expect(res.output?.publicPath).to.eql('http://localhost:1234/');
      expect(res.devServer?.port).to.eql(1234);
    });
  });
});
