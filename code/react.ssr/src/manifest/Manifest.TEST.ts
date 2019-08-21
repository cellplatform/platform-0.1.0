import { expect, testManifest, testManifestDef, fs } from '../test';
import { Manifest } from './Manifest';

const tmp = fs.resolve('tmp');
const url = 'https://sfo2.digitaloceanspaces.com/platform/modules/react.ssr/manifest.yml';

describe('Manifest', () => {
  it('loads from file', async () => {
    const def = await testManifestDef();
    const manifest = Manifest.create({ def, url });
    expect(manifest.ok).to.eql(true);
    expect(manifest.status).to.eql(200);
    expect(manifest.sites.length).to.greaterThan(0);
  });

  describe('site()', () => {
    it('undefined', async () => {
      const manifest = await testManifest();
      const test = (domain?: string) => {
        const site = manifest.site.byHost(domain);
        expect(site).to.eql(undefined);
      };
      test();
      test('');
      test('NO_EXIST');
    });

    it('finds by host (domain)', async () => {
      const manifest = await testManifest();
      const test = (domain?: string) => {
        const site = manifest.site.byHost(domain);
        expect(site).to.not.eql(undefined);
      };
      test('localhost');
      test('  localhost  ');
      test('http://localhost');
      test('  http://localhost  ');
      test('foobar.now.sh');
      test('  https://foobar.now.sh  '); // NB: matches on regex.
    });

    it('finds by name', async () => {
      const manifest = await testManifest();
      const test = (name?: string, expected?: boolean) => {
        const site = manifest.site.byName(name);
        expect(Boolean(site)).to.eql(expected);
      };
      test('localhost', false);
      test('dev', true);
      test('', false);
      test('NO_EXIST', false);
      test(undefined, false);
    });
  });

  describe('change.version', () => {
    const saveTo = fs.join(tmp, 'manifest.yml');

    beforeEach(async () => fs.remove(saveTo));

    it('site not found (undefined)', async () => {
      const manifest = await testManifest();
      const res = await manifest.change.site('NO_EXIST').version({ version: '2.0.0', saveTo });
      expect(res).to.eql(undefined);
    });

    it('changes and saves', async () => {
      const manifest = await testManifest();

      const site1 = manifest.site.byName('dev');
      expect(site1 && site1.version).to.eql('1.2.3-alpha.0');

      // Saved and new manifest instance returned.
      const res = await manifest.change.site('dev').version({ version: '2.0.0', saveTo });
      expect(res).to.be.an.instanceof(Manifest);
      expect(res).to.not.equal(manifest); // Different instance.

      const site2 = res && res.site.byName('dev');
      expect(site2 && site2.version).to.eql('2.0.0');

      // Check the saved file.
      const fromFile = await Manifest.fromFile({ path: saveTo, url });
      const site3 = fromFile.site.byName('dev');
      expect(site3 && site3.version).to.eql('2.0.0');
    });
  });
});
