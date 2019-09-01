import { loader, t } from '../common';
import * as state from '../state';

type IShellArgs = { loader: loader.ILoader };

/**
 * Primary API for the shell.
 */
export class Shell implements t.IShell {
  /**
   * [Lifecycle]
   */
  public static singleton = new Shell({ loader: loader.singleton });
  private constructor(args: IShellArgs) {
    this.loader = args.loader;
  }

  /**
   * [Fields]
   */
  public readonly loader: loader.ILoader;
  public readonly state: t.IShellState = state.shell.create();
  public defaultModuleId: string;

  /**
   * [Methods]
   */
  public register = (
    moduleId: string,
    importer: t.ShellImporter,
    options?: { timeout?: number },
  ) => {
    this.loader.add(moduleId, importer, options);
    return this;
  };

  public default(moduleId: string) {
    this.defaultModuleId = moduleId;
    return this;
  }

  public async load<P = {}>(moduleId: string | number, props?: P) {
    // Load the module.
    const res = await this.loader.load<t.ShellImporterResponse>(moduleId, props);

    // Initialize the loaded module.
    if (res.ok && res.result) {
      if (!(typeof res.result.init === 'function')) {
        res.ok = false;
        res.error = new Error(`The module '${moduleId}' does not have an [init] function`);
      } else {
        const shell = this; // tslint:disable-line
        const args: t.ShellImportInitArgs = { shell };
        await res.result.init(args);
      }
    }

    // Finish up.
    const { ok, count, error, timedOut } = res;
    return { ok, count, error, timedOut };
  }
}
