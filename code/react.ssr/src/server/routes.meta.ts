import * as t from './types';

const CACHE = { 'Cache-Control': `s-maxage=5000, stale-while-revalidate` };

export function init(args: { router: t.IRouter; getManifest: t.GetManifest }) {
  const { router, getManifest } = args;

  /**
   * [GET] manifest/summary.
   */
  router.get('/.manifest/summary', async req => {
    const manifest = await getManifest();
    const sites = manifest.sites.reduce((acc, site) => {
      const { name, version, size } = site;
      const domain = site.domain.join(', ');
      return { ...acc, [name]: { version, size, domain } };
    }, {});
    return {
      status: 200,
      headers: CACHE,
      data: { sites },
    };
  });

  /**
   * [GET] manifest.
   */
  router.get('/.manifest', async req => {
    const manifest = await getManifest({ force: true });
    return {
      status: 200,
      headers: CACHE,
      data: manifest.toObject(),
    };
  });
}
