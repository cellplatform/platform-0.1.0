import { Site } from '.';
import { expect, testManifest } from '../test';

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
});
