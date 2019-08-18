import { Manifest, Site } from '.';
import { expect, testManifest, testManifestDef } from '../test';

const testSite = async () => {
  const manifest = await testManifest();
  const site = await manifest.site.byHost('localhost');
  return site as Site;
};

describe('Site', () => {
  it('props (default)', async () => {
    const site = await testSite();
    expect(site.domain).to.include('localhost');
    expect(site.version).to.eql('1.2.3-alpha.0');
    expect(site.files).to.eql([]);
    expect(site.name).to.eql('dev');
  });

  it('no name', async () => {
    const def = await testManifestDef();
    delete def.sites[0].name;
    const manifest = Manifest.create({ def });
    const site = manifest.site.byHost('localhost');
    expect(site && site.name).to.eql('');
  });

  it('routes', async () => {
    const site = await testSite();
    const res = site.routes;
    expect(res.length).to.greaterThan(0);
  });

  describe('version', () => {
    it('from bundle path', async () => {
      const def = await testManifestDef();
      delete def.sites[0].version; // Ensure no version for test.
      const manifest = Manifest.create({ def });
      const site = manifest.site.byHost('localhost');
      expect(site && site.version).to.eql('1.2.3-alpha.0');
    });

    it('explicitly declared on manifest def (overrides bundle path)', async () => {
      const def = await testManifestDef();
      def.sites[0].version = '4.5.6';

      const manifest = Manifest.create({ def });
      const site = manifest.site.byHost('localhost');
      expect(site && site.version).to.eql('4.5.6');
    });
  });
});
