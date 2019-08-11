import { http, t, util, pathToRegex, cheerio } from '../common';

export type IRouteArgs = { site: t.ISiteManifest; route: t.ISiteManifestRoute };

type IEntry = {
  ok: boolean;
  status: number;
  url: string;
  html: string;
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
  private _entry: IEntry | undefined;
  private _regexps: RegExp[] | undefined;

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
    const filename = this.def.entry;
    const url = `${this.site.bundle}/${filename}`;
    const res = await http.get(url);
    if (!res.ok) {
      status = res.status;
    }
    let html = res.ok ? res.body : '';
    html = this.formatHtml({ html, filename });

    // console.log('this.def.entry', this.def.entry);

    // Insert the SSR entry html.

    // Prepare the entry-object.
    const ok = status.toString().startsWith('2');
    const entry: IEntry = {
      ok,
      status,
      url,
      html,
    };

    // Finish up.
    this._entry = entry;
    return entry;
  }

  /**
   * Determines if the given path matches the route.
   */
  public isMatch(path: string) {
    if (!this._regexps) {
      this._regexps = this.paths.map(pattern => pathToRegex(pattern));
    }
    return this._regexps.some(regex => Boolean(regex.exec(path)));
  }

  /**
   * Object representation of the Route.
   */
  public toObject() {
    return { ...this.def };
  }

  /**
   * [Helpers]
   */
  private formatHtml(args: { filename: string; html: string }) {
    const entry = this.site.entries.find(item => item.file === args.filename);
    if (!args.html || !entry) {
      return args.html;
    }
    const $ = cheerio.load(args.html);
    $(`div#${entry.id}`).html(entry.html);
    $(`head`).append(`<style>${entry.css}</style>`);
    return $.html();
  }
}
