import { ConfigBuilder } from '../language';
import { expect } from '../test';
import { toWebpackConfig } from './toWebpackConfig';

const create = () => {
  const model = ConfigBuilder.model();
  const builder = ConfigBuilder.create(model);
  return { model, builder };
};

describe.only('Compiler', function () {
  describe('toWebpackConfig', () => {
    it('default values', () => {
      const { builder } = create();
      const res = toWebpackConfig(builder.toObject());

      expect(res.mode).to.eql('production');
      expect(res.output?.publicPath).to.eql('http://localhost:3000/');
      expect(res.devServer?.port).to.eql(3000);
    });

    it('custom values', () => {
      const { builder } = create();
      const res = toWebpackConfig(builder.port(1234).mode('dev').toObject());

      expect(res.mode).to.eql('development');
      expect(res.output?.publicPath).to.eql('http://localhost:1234/');
      expect(res.devServer?.port).to.eql(1234);
    });
  });
});
