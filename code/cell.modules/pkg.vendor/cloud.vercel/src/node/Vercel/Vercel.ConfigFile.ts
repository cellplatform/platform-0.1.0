import { fs } from '@platform/fs';
import { t, R } from './common';

/**
 * Helpers for working with the [vercel.json] file.
 *
 * Ref:
 *    https://vercel.com/docs/project-configuration
 *
 */
export const VercelConfigFile = {
  paths(dir: string) {
    dir = fs.resolve(dir);
    const filename = 'vercel.json';
    const configPath = fs.join(dir, filename);
    const manifestPath = fs.join(dir, 'index.json');
    return { dir, filename, configPath, manifestPath };
  },

  async loadOrCreate(dir: string, defaultConfig: t.VercelConfigFile = {}) {
    const path = VercelConfigFile.paths(dir).configPath;
    if (!(await fs.pathExists(path))) await fs.writeJson(path, defaultConfig);
    return (await fs.readJson(path)) as t.VercelConfigFile;
  },

  async save(dir: string, config: t.VercelConfigFile) {
    const path = VercelConfigFile.paths(dir).configPath;
    const json = JSON.stringify(config, null, '  ');
    await fs.writeFile(path, json);
  },

  async loadManifest(dir: string) {
    const path = VercelConfigFile.paths(dir).manifestPath;
    if (!(await fs.pathExists(path))) return undefined;
    return (await fs.readJson(path)) as t.Manifest;
  },

  async loadModuleManifest(dir: string) {
    const manifest = await VercelConfigFile.loadManifest(dir);
    const kind = (manifest as any)?.kind;
    return kind === 'module' ? (manifest as t.ModuleManifest) : undefined;
  },

  /**
   * Run preparation on a "vercel.json" configuration file.
   */
  async prepare(args: {
    dir: string;
    moduleRewrites?: boolean;
    moduleHeaders?: boolean;
    modifyBeforeSave?: (e: {
      dir: string;
      config: t.VercelConfigFile;
    }) => Promise<t.VercelConfigFile | undefined | void>;
  }) {
    const { moduleRewrites = true, moduleHeaders = true, modifyBeforeSave } = args;
    const { dir } = VercelConfigFile.paths(args.dir);

    let config = await VercelConfigFile.loadOrCreate(dir);

    if (moduleHeaders) {
      config = await VercelConfigFile.prepareModuleHeaders({ dir, config });
    }

    if (moduleRewrites) {
      config = await VercelConfigFile.prepareModuleRewrites({ dir, config });
    }

    if (modifyBeforeSave) {
      const res = await modifyBeforeSave({ dir, config: R.clone(config) });
      if (res) config = res;
    }

    // Write file.
    await VercelConfigFile.save(dir, config);
  },

  /**
   * Insert a set of redirects for each [.js] file in the bundle, ensuring they will be
   * rendered from any deep path from the root of the Vercel deployment.
   *
   * Ref:
   *    https://vercel.com/docs/project-configuration#project-configuration/rewrites
   *
   * HACK:
   *    Note that this is a hack being employed until an adequate regex source/destination
   *    pattern can be figured out that does this automatically.
   *
   */
  async prepareModuleRewrites(args: { dir: string; config?: t.VercelConfigFile }) {
    const { dir } = VercelConfigFile.paths(args.dir);
    const config = { ...(args.config ?? (await VercelConfigFile.loadOrCreate(dir))) };
    if (!config.rewrites) config.rewrites = [];

    // Prepare the routes.
    const filenames = (await fs.readdir(dir)).filter((filename) => filename.endsWith('.js'));
    const rewrites: t.VercelConfigRewrite[] = filenames.map((filename) => ({
      source: `/:path*/${filename}`,
      destination: `/${filename}`,
    }));

    // NOTE:
    //    Place before all other rewrites to ensure the direct file names
    //    get caught before any more generalized route-pattern matching occurs.
    config.rewrites = [...rewrites, ...config.rewrites];
    return config;
  },

  /**
   * Add "module:version" details as headers to the module files.
   */
  async prepareModuleHeaders(args: { dir: string; config?: t.VercelConfigFile }) {
    const { dir } = VercelConfigFile.paths(args.dir);
    const config = { ...(args.config ?? (await VercelConfigFile.loadOrCreate(dir))) };
    const manifest = await VercelConfigFile.loadModuleManifest(dir);
    if (!manifest) return config;

    const { namespace, version } = manifest.module;
    const hash = manifest.hash.module;
    const header: t.VercelConfigHeader = {
      source: '/(.*)',
      headers: [
        {
          key: 'x-module',
          value: `${namespace}@${version}#${hash}`,
        },
      ],
    };

    const headers = [...(config.headers || []), header];
    return { ...config, headers };
  },
};
