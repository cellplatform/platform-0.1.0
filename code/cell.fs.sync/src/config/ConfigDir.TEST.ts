import { fs, expect } from '../test';
import { ConfigDir } from '.';
import { DEFAULT } from './ConfigDir';

const PATH = {
  ASSETS: 'sample/assets',
  TMP: fs.resolve('tmp'),
};

describe('ConfigDir', () => {
  it('uses __dirname by default', () => {
    const res = ConfigDir.create();
    expect(res.dir).to.eql(`${__dirname}/.cell`);
    expect(res.file).to.eql(`${__dirname}/.cell/config.yml`);
  });

  it('uses given directory path', () => {
    const dir = PATH.ASSETS;
    const res = ConfigDir.create({ dir });
    expect(res.dir).to.eql(fs.resolve(`${PATH.ASSETS}/.cell`));
    expect(res.file).to.eql(fs.resolve(`${PATH.ASSETS}/.cell/config.yml`));
  });

  describe('load', () => {
    it('creates dir and default config.yml', async () => {
      await fs.remove(PATH.TMP);
      const config = await ConfigDir.load({ dir: PATH.TMP });

      expect(fs.pathExistsSync(PATH.TMP)).to.eql(true);
      expect(fs.pathExistsSync(`${PATH.TMP}/.cell`)).to.eql(true);
      expect(fs.pathExistsSync(`${PATH.TMP}/.cell/config.yml`)).to.eql(true);

      const file = await fs.file.loadAndParse(config.file);
      expect(file).to.eql(DEFAULT);
    });

    it('load existing data', async () => {
      await fs.remove(PATH.TMP);

      const config1 = await ConfigDir.load({ dir: PATH.TMP });

      config1.data.host = 'domain.com:8080';
      config1.data.target = 'foo';
      await config1.save();

      const config2 = await ConfigDir.load({ dir: PATH.TMP });
      expect(config2.data.host).to.eql('domain.com:8080');
      expect(config2.data.target).to.eql('foo');
    });
  });
});
