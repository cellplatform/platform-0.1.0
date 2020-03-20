import { fs, expect, t, expectError } from '../test';
import { ConfigDir } from '.';
import { CONFIG } from './ConfigDir';

const VALID: t.IFsConfigDirData = { host: 'domain.com', target: 'cell:foo:A1' };
const PATH = {
  ASSETS: 'sample/assets',
  TMP: fs.resolve('tmp'),
};

describe('ConfigDir', () => {
  beforeEach(() => fs.remove(PATH.TMP));

  it('uses __dirname by default', () => {
    const res = ConfigDir.create();
    expect(res.dir).to.eql(`${__dirname}`);
    expect(res.file).to.eql(`${__dirname}/.cell/config.yml`);
  });

  it('uses given directory path', () => {
    const dir = PATH.ASSETS;
    const res = ConfigDir.create({ dir });
    expect(res.dir).to.eql(fs.resolve(`${PATH.ASSETS}`));
    expect(res.file).to.eql(fs.resolve(`${PATH.ASSETS}/.cell/config.yml`));
  });

  it('target.uri', async () => {
    const config = await ConfigDir.create({ dir: PATH.TMP }).save(VALID);
    const uri = config.target.uri;
    expect(uri.ok).to.eql(true);
    expect(uri.toString()).to.eql('cell:foo:A1');
  });

  it('target.url', async () => {
    const config = await ConfigDir.create({ dir: PATH.TMP }).save(VALID);
    const url = config.target.url;
    expect(url).to.eql('https://domain.com/cell:foo:A1/files');
  });

  describe('load', () => {
    it('does not know if file exists (load not called)', () => {
      const config = ConfigDir.create({ dir: PATH.TMP });
      expect(config.exists).to.eql(null);
    });

    it('does not exist', async () => {
      const config = await ConfigDir.load({ dir: PATH.TMP });
      expect(config.exists).to.eql(false);
    });

    it('load existing data', async () => {
      const config1 = await ConfigDir.load({ dir: PATH.TMP });
      expect(config1.exists).to.eql(false);

      config1.data.host = 'domain.com:8080';
      config1.data.target = 'cell:foo:A1';

      await config1.save();
      expect(config1.exists).to.eql(true);

      const config2 = await ConfigDir.load({ dir: PATH.TMP });
      expect(config2.data.host).to.eql('domain.com:8080');
      expect(config2.data.target).to.eql('cell:foo:A1');
    });
  });

  describe('save', () => {
    it('throws if saving invalid data', async () => {
      const config = await ConfigDir.create({ dir: PATH.TMP }).save(VALID);
      config.data.target = 'boo'; // NB: invalid.
      await expectError(() => config.save());
    });
  });

  describe('validation', () => {
    it('valid', async () => {
      const config = await ConfigDir.create({ dir: PATH.TMP }).save(VALID);
      const res = config.validate();
      expect(config.isValid).to.eql(true);
      expect(res.isValid).to.eql(true);
      expect(res.errors).to.eql([]);
    });

    it('invalid', async () => {
      const test = async (modify: (data: t.IFsConfigDirData) => void, error: string) => {
        const config = await ConfigDir.create({ dir: PATH.TMP }).save(VALID);
        modify(config.data);
        const res = config.validate();
        const hasError = res.errors.some(e => e.message.includes(error));
        expect(res.isValid).to.eql(false, error);
        expect(hasError).to.eql(true, error);
        expect(config.isValid).to.eql(false, error);
      };

      await test(d => (d.target = ''), CONFIG.ERROR.TARGET.INVALID_URI);
      await test(d => (d.target = 'ns:foo'), CONFIG.ERROR.TARGET.INVALID_URI);
      await test(d => (d.target = 'cell:foo:A'), CONFIG.ERROR.TARGET.INVALID_URI);
      await test(d => (d.target = 'cell:foo:1'), CONFIG.ERROR.TARGET.INVALID_URI);

      await test(d => (d.host = ''), CONFIG.ERROR.HOST.EMPTY);
      await test(d => (d.host = '  '), CONFIG.ERROR.HOST.EMPTY);
    });
  });
});
