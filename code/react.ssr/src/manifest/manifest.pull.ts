import { fs, http, jsYaml, t, value } from '../common';
import { Site } from './Site';

export type IPullResonse = {
  ok: boolean;
  status: number;
  manifest: t.IManifest;
  error?: Error;
};

let CACHE: any = {};

/**
 * Clears the cache.
 */
export function reset() {
  CACHE = {};
}

// /**
//  * Gets the manifest (from cache if already pulled).
//  */
// export async function get(args: {
//   url: string; // URL to the manifest.yml (NB: don't use a caching CDN).
//   baseUrl?: string; // If different from `url` (use this to pass in the Edge/CDN alternative URL).
//   force?: boolean;
// }) {
//   const { url } = args;
//   let manifest = CACHE[url] as t.IManifest;
//   if (!manifest || args.force) {
//     manifest = (await pull(args)).manifest;
//     CACHE[url] = manifest;
//   }

//   const res = {
//     manifest,

//     /**
//      * Retrieve the Site with the given domain.
//      */
//     site(args: { domain: string; force?: boolean }) {
//       const { domain } = args;
//       const key = `${url}:${domain}`;

//       let site = CACHE[key] as Site | undefined;
//       if (!site || args.force) {
//         site = Site.find({ manifest, domain });
//         CACHE[key] = site;
//       }

//       return site;
//     },

//     /**
//      * Retrieve the route at the given domain/path.
//      */
//     route(args: { domain: string; path: string; force?: boolean }) {
//       const { domain, path, force } = args;
//       const site = res.site({ domain, force });
//       return site ? site.route({ path }) : undefined;
//     },
//   };

//   return res;
// }

/**
 * Pulls the and parses the YAML manifest from the given url.
 */
export async function pull(args: { url: string; baseUrl?: string }): Promise<IPullResonse> {
  const { url } = args;
  const empty: t.IManifest = { sites: [] };
  const base = args.baseUrl || fs.dirname(url);

  const errorResponse = (status: number, error: string): IPullResonse => {
    const manifest = empty;
    return { ok: false, status, error: new Error(error), manifest };
  };

  // Retrieve manifiest from network.
  const res = await http.get(args.url);
  if (!res.ok) {
    const error =
      res.status === 403
        ? `The manifest YAML has not been made "public" on the internet.`
        : `Failed while pulling manifest YAML from cloud.`;
    return errorResponse(403, error);
  }

  // Attempt to parse the yaml.
  const yaml = parseYaml(res.body);
  if (!yaml.ok || !yaml.data) {
    const error = `Failed to parse manifest YAML. ${yaml.error.message}`;
    return errorResponse(500, error);
  }

  // Process the set of sites.
  const sitesData: any[] = yaml.data.sites || [];
  if (!Array.isArray(sitesData)) {
    const error = `The manifest YAML "sites" field is not an array.`;
    return errorResponse(500, error);
  }

  let sites: t.ISiteManifest[] = [];
  for (const input of sitesData) {
    const site = await formatSite({ input, base });
    sites = site ? [...sites, site] : sites;
  }

  // Finish up.
  const manifest: t.IManifest = { sites };
  return { ok: true, status: 200, manifest };
}

/**
 * [Helpers]
 */
function parseYaml(text: string) {
  try {
    const data = jsYaml.safeLoad(text);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}

const asString = (value?: any) => (typeof value === 'string' ? (value as string) : '').trim();

async function formatSite(args: { input: any; base: string }) {
  const { input, base } = args;
  if (typeof input !== 'object') {
    return;
  }

  // Domain name.
  let domain = asString(input.domain);
  domain = domain
    .replace(/^https/, '')
    .replace(/^http/, '')
    .replace(/^\:\/\//, '');

  // Bundle.
  let bundle = asString(input.bundle);
  bundle = (bundle ? `${base}/${bundle}` : bundle).replace(/\/*$/, '');

  // Routes.
  let routes = typeof input.routes === 'object' ? input.routes : {};
  routes = Object.keys(routes).reduce((acc, next) => {
    const input = routes[next];
    if (input) {
      const route = formatSiteRoute({ input });
      if (route) {
        acc[next] = route;
      }
    }
    return acc;
  }, {});

  // Get the file manifest.
  const res = await http.get(`${bundle}/manifest.yml`);
  const manifest = res.ok ? jsYaml.safeLoad(res.body) : undefined;
  const files = manifest ? manifest.files : [];
  const dirs = manifest ? manifest.dirs : [];

  // Finish up.
  const site: t.ISiteManifest = { domain, bundle, routes, files, dirs };
  return site;
}

export function formatSiteRoute(args: { input: any }): t.ISiteManifestRoute | undefined {
  const { input } = args;
  if (typeof input !== 'object') {
    return undefined;
  }

  const entry = asString(input.entry);
  const paths: any[] = Array.isArray(input.path) ? input.path : [input.path];
  const path = paths.filter(path => Boolean(path) && typeof path === 'string');

  return { entry, path };
}
