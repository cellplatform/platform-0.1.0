import { t } from '../common';

/**
 * Definition of a site.
 */
export class Site {
  /**
   * [Lifecycle]
   */
  public constructor(args: { def: t.ISiteManifest }) {
    this.def = args.def;
  }

  /**
   * [Fields]
   */

  private readonly def: t.ISiteManifest;
}
