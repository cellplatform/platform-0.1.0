import { t, fs, Site } from './common';

const CACHE = { 'Cache-Control': `s-maxage=5, stale-while-revalidate` };

export function init(args: { router: t.IRouter; getManifest: t.GetManifest }) {
  const { router, getManifest } = args;

  /**
   * [GET] summary of all sites
   */
  router.get('/.manifest/summary', async req => {
    const manifest = await getManifest();
    const sites = manifest.sites.reduce((acc, site) => {
      const info = toSiteInfo({ site });
      return { ...acc, [site.name]: info };
    }, {});
    return {
      status: 200,
      headers: CACHE,
      data: { sites },
    };
  });

  /**
   * [GET] summary of single sites
   */
  router.get('/.manifest/summary/:site', async req => {
    const manifest = await getManifest();
    const site = manifest.site.byName(req.params.site);
    if (site) {
      return {
        status: 200,
        headers: CACHE,
        data: toSiteInfo({ site, name: true, files: true }),
      };
    } else {
      const status = 404;
      const message = `Site named '${req.params.site || 'UNNAMED'}' not found in manifest.`;
      return {
        status,
        data: { status, message },
      };
    }
  });

  /**
   * [GET] raw manifest.
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

/**
 * [Helpers]
 */

function toSiteInfo(args: { site: Site; name?: boolean; files?: boolean }) {
  const { site } = args;
  const { name, version, size } = site;
  const domain = site.domain.join(', ');
  let info: {} = { version, size, domain };

  if (args.name) {
    info = { name, ...info };
  }

  if (args.files) {
    const files = site.files.map(file => {
      const { path, bytes } = file;
      const size = fs.size.toString(bytes);
      return { path, size, bytes };
    });
    info = { ...info, files };
  }

  return info;
}
