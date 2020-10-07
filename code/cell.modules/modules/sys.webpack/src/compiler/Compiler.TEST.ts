import { expect, rx } from '../test';
import { Compiler } from '.';
import { WebpackBuilders } from '../language';
import { toWebpackConfig } from './toWebpackConfig';

const create = () => {
  const bus = rx.bus();
  const model = WebpackBuilders.config.model();
  const builder = WebpackBuilders.config.create(bus, model);
  return { bus, model, builder };
};

describe.only('Compiler', function () {
  this.timeout(90000);

  describe('bundle', () => {
    it('bundle', async () => {
      const { builder } = create();

      // builder.

      const res = await Compiler.bundle(builder);

      console.log('-------------------------------------------');
      console.log('res', res);

      // const res = WebPack.bundle(builder);
    });
  });

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
