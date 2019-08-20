import { t, fs } from '../common';

/**
 * A parser for the `ssr.yml` configuration file.
 */
export class Config {
  /**
   * [Lifecycle]
   */
  public static create = async (options: { path?: string } = {}) => {
    const path = fs.resolve(options.path || './ssr.yml');
    if (!(await fs.pathExists(path))) {
      throw new Error(`An "ssr.yml" configuration file does not exist at: ${path}`);
    }

    const def = await fs.file.loadAndParse<t.ISsrConfig>(path);

    return new Config({ def });
  };
  private constructor(args: { def: t.ISsrConfig }) {
    this.def = args.def;
  }

  /**
   * [Fields]
   */
  private readonly def: t.ISsrConfig;

  /**
   * [Properties]
   */
  public get builder() {
    const builder = this.def.builder || {};
    builder.bundles = builder.bundles || 'bundles';
    builder.entries = builder.entries || '';
    return builder;
  }
}
