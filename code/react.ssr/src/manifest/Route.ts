import { t, fs, http } from '../common';
import * as util from './util';

export type IRouteArgs = { site: t.ISiteManifest; route: t.ISiteManifestRoute };

export type IRemoteFile = {
  ok: boolean;
  status: number;
  url: string;
  body: string;
};

/**
 * Definition of a site route.
 */
export class Route {
  /**
   * [Static]
   */
  public static format(args: { input: any }): t.ISiteManifestRoute | undefined {
    const { input } = args;
    if (typeof input !== 'object') {
      return undefined;
    }

    const entry = util.asString(input.entry);
    const paths: any[] = Array.isArray(input.path) ? input.path : [input.path];
    const path = paths.filter(path => Boolean(path) && typeof path === 'string');

    return { entry, path };
  }

  /**
   * [Lifecycle]
   */
  public static create = (args: IRouteArgs) => new Route(args);
  private constructor(args: IRouteArgs) {
    this.site = args.site;
    this.def = args.route;
  }

  /**
   * [Fields]
   */
  private readonly site: t.ISiteManifest;
  private readonly def: t.ISiteManifestRoute;
  private _entry: IRemoteFile | undefined;

  /**
   * [Properties]
   */
  public get paths() {
    return this.def.path;
  }

  /**
   * [Methods]
   */

  /**
   * Retrieve the entry details for the route.
   */
  public async entry(args: { force?: boolean } = {}) {
    if (this._entry && !args.force) {
      return this._entry;
    }

    // Read in the entry-file HTML.
    let status = 200;
    const url = `${this.site.bundle}/${this.def.entry}`;
    const res = await http.get(url);
    if (!res.ok) {
      status = res.status;
    }
    const body = res.ok ? res.body : '';

    // Prepare the entry-object.
    const ok = status.toString().startsWith('2');
    const entry: IRemoteFile = {
      ok,
      status,
      url,
      body,
    };

    // Finish up.
    this._entry = entry;
    return entry;
  }
}
