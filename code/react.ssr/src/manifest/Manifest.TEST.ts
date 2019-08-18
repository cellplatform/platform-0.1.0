import { expect, fs, YAML_MANIFEST, t, getTestManifest } from '../test';
import { Manifest } from './Manifest';

describe('Manifest', () => {
  it('loads from file', async () => {
    const def = await fs.file.loadAndParse<t.IManifest>(YAML_MANIFEST);
    const manifest = Manifest.create({ def });
    expect(manifest.ok).to.eql(true);
    expect(manifest.status).to.eql(200);
    expect(manifest.sites.length).to.greaterThan(0);
  });

  describe('site()', () => {
    it('undefined', async () => {
      const manifest = await getTestManifest();
      const test = (domain?: string) => {
        const site = manifest.site.byDomain(domain);
        expect(site).to.eql(undefined);
      };
      test();
      test('');
      test('NO_EXIST');
    });

    it('finds given domain', async () => {
      const manifest = await getTestManifest();
      const test = (domain?: string) => {
        const site = manifest.site.byDomain(domain);
        expect(site).to.not.eql(undefined);
      };
      test('localhost');
      test('  localhost  ');
      test('http://localhost');
      test('  http://localhost  ');
      test('foobar.now.sh');
      test('  https://foobar.now.sh  ');
    });
  });
});
