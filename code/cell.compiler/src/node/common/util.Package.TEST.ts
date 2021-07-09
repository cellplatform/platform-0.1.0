import { expect, expectError, fs } from '../../test';
import { Package } from './util.Package';

const PATH = fs.resolve('./tmp/test/util.Package/package.json');
const TEMPLATE = {
  name: 'foo',
  verion: '0.0.0',
};

describe('util.Package', () => {
  const loadJson = async () => (await fs.readJson(PATH)) as { version: string };
  const expectVersionInFile = async (version: string) => {
    const json = await loadJson();
    expect(json.version).to.eql(version);
  };

  beforeEach(async () => {
    await fs.ensureDir(fs.dirname(PATH));
    await fs.writeFile(PATH, JSON.stringify(TEMPLATE, null, '  '));
  });

  after(async () => {
    await fs.remove(fs.dirname(PATH));
  });

  describe('bump', () => {
    it('patch', async () => {
      const res1 = await Package.bump(PATH, 'patch');
      expect(res1.version.from).to.eql('0.0.0');
      expect(res1.version.to).to.eql('0.0.1');
      expect(res1.json.version).to.eql('0.0.1');
      await expectVersionInFile('0.0.1');

      const res2 = await Package.bump(PATH, 'patch');
      expect(res2.version.from).to.eql('0.0.1');
      expect(res2.version.to).to.eql('0.0.2');
      expect(res2.json.version).to.eql('0.0.2');
      await expectVersionInFile('0.0.2');
    });

    it('minor', async () => {
      const res = await Package.bump(PATH, 'minor');
      expect(res.version.to).to.eql('0.1.0');
      await expectVersionInFile(res.version.to);
    });

    it('major', async () => {
      const res = await Package.bump(PATH, 'major');
      expect(res.version.to).to.eql('1.0.0');
      await expectVersionInFile(res.version.to);
    });

    it('alpha', async () => {
      const res1 = await Package.bump(PATH, 'alpha');
      const res2 = await Package.bump(PATH, 'alpha');
      const res3 = await Package.bump(PATH, 'alpha');

      expect(res1.version.from).to.eql('0.0.0');
      expect(res1.version.to).to.eql('0.0.1-alpha.0');

      expect(res2.version.from).to.eql('0.0.1-alpha.0');
      expect(res2.version.to).to.eql('0.0.1-alpha.1');

      expect(res3.version.from).to.eql('0.0.1-alpha.1');
      expect(res3.version.to).to.eql('0.0.1-alpha.2');
    });

    it('beta', async () => {
      const res1 = await Package.bump(PATH, 'beta');
      const res2 = await Package.bump(PATH, 'beta');

      expect(res1.version.from).to.eql('0.0.0');
      expect(res1.version.to).to.eql('0.0.1-beta.0');

      expect(res2.version.from).to.eql('0.0.1-beta.0');
      expect(res2.version.to).to.eql('0.0.1-beta.1');
    });

    it('sequence (alpha ➔ beta ➔ patch ➔ minor ➔ major)', async () => {
      const res1 = await Package.bump(PATH, 'alpha');
      const res2 = await Package.bump(PATH, 'beta');
      const res3 = await Package.bump(PATH, 'patch');
      const res4 = await Package.bump(PATH, 'minor');
      const res5 = await Package.bump(PATH, 'major');

      expect(res1.version.to).to.eql('0.0.1-alpha.0');
      expect(res2.version.to).to.eql('0.0.1-beta.0');
      expect(res3.version.to).to.eql('0.0.1');
      expect(res4.version.to).to.eql('0.1.0');
      expect(res5.version.to).to.eql('1.0.0');
    });

    it('throw: not supported', async () => {
      await expectError(async () => {
        await Package.bump(PATH, 'foo' as any);
      }, 'Version bump level [foo] not supported');
    });
  });
});
