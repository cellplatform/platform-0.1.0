import { fs, http, t, util, pathToRegex, cheerio } from '../common';

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

  public get version() {
    return util.firstSemver(this.site.bundle) || '0.0.0';
  }

  public get bundleUrl() {
    const base = util.stripSlashes(this.site.baseUrl);
    const path = util.stripSlashes(this.site.bundle);
    return `${base}/${path}`;
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
    const filename = this.def.entry;
    const url = `${this.bundleUrl}/${filename}`;
    const res = await http.get(url);

    let status = 200;
    if (!res.ok) {
      status = res.status;
    }
    let html = res.ok ? res.body : '';
    const version = this.version;
    html = this.formatHtml({ html, filename, version });

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
  private formatHtml(args: { filename: string; html: string; version: string }) {
    const { filename, html, version } = args;
    const site = this.site;
    const files = site.files;

    const entry = site.entries.find(item => item.file === filename);
    if (!html || !entry) {
      return html;
    }

    // Load the page HTML.
    const $ = cheerio.load(html);

    // Setup root react DIV container.
    const root = $(`div#${entry.id}`);
    root.attr('data-version', version);
    root.html(entry.html);

    // Setup the <head>.
    const head = $('head');
    head.append(`<style>${entry.css}</style>`);

    // Assign informational file-size attributes to referenced assets.
    // NB: This is helpful for monitoring initial load size of an app.
    files
      .filter(file => file.path.endsWith('.js'))
      .forEach(file => sizeAttr(file.bytes, $(`script[src="${fs.basename(file.path)}"]`)));

    files
      .filter(file => file.path.endsWith('.css'))
      .forEach(file => sizeAttr(file.bytes, $(`link[href="${fs.basename(file.path)}"]`)));

    // Finish up.
    return $.html();
  }
}

function sizeAttr(bytes: number, el: Cheerio) {
  if (el.length > 0) {
    el.attr('data-size', fs.size.toString(bytes, { round: 0 }));
  }
}
