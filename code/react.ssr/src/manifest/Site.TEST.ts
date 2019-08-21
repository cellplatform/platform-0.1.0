import { Manifest, Site } from '.';
import { expect, testManifest, testManifestDef } from '../test';

const url = 'https://sfo2.digitaloceanspaces.com/platform/modules/react.ssr/manifest.yml';

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

  it('throws when no name', async () => {
    const def = await testManifestDef();
    delete def.sites[0].name;
    const manifest = Manifest.create({ def, url });

    const fn = () => manifest.site.byHost('localhost');
    expect(fn).to.throw(/must have a name/);
  });

  it('routes', async () => {
    const site = await testSite();
    const res = site.routes;
    expect(res.length).to.greaterThan(0);
  });

  it('version from bundle path', async () => {
    const def = await testManifestDef();
    const manifest = Manifest.create({ def, url });
    const site = manifest.site.byHost('localhost');
    expect(site && site.version).to.eql('1.2.3-alpha.0');
  });
});
