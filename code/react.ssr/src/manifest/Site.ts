import { t } from '../common';
import { Route } from './Route';

/**
 * Definition of a site.
 */
export class Site {
  /**
   * [Static]
   */
  public static find(args: { manifest: t.IManifest; domain: string }) {
    const { manifest, domain } = args;
    const def = manifest.sites.find(item => item.domain === domain);
    return def ? new Site({ def }) : undefined;
  }

  /**
   * [Lifecycle]
   */
  public constructor(args: { def: t.ISiteManifest }) {
    const { def } = args;
    this.def = def;

    const routes = def ? Object.keys(def.routes).map(key => def.routes[key]) : [];
    this.routes = routes.map(route => new Route({ site: def, route }));
  }

  /**
   * [Fields]
   */
  private readonly def: t.ISiteManifest;
  public readonly routes: Route[];

  /**
   * [Methods]
   */
  public route(args: { path: string }) {
    return this.routes.find(route => route.paths.includes(args.path));
  }
}
