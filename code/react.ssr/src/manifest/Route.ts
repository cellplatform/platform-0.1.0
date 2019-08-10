import { t, fs, http } from '../common';

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
   * [Lifecycle]
   */
  public constructor(args: { site: t.ISiteManifest; route: t.ISiteManifestRoute }) {
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
