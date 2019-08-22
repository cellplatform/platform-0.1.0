import { expect, fs, YAML_MANIFEST, t, testManifest } from '../test';
import { Manifest, Site, Route } from '.';

const testSite = async () => {
  const manifest = await testManifest();
  const site = await manifest.site.byHost('localhost');
  return site as Site;
};

describe('Route', () => {
  it('route props', async () => {
    const site = await testSite();
    const route = site.route('/');
    expect(route && route.paths).to.eql(['/', '/foo']);
    expect(route && route.version).to.eql('1.2.3-alpha.0');
  });

  // it.only('entry', async () => {
  //   const site = await testSite();
  //   const route = site.route('/');
  //   const entry = route && (await route.entry());
  // });
});
