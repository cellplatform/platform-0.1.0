import { t, fs, R } from '../common';

export type ILoadArgs = { path?: string; throw?: boolean };
export type ILoadResponse = { path: string; exists: boolean; data: t.IHttpConfig };

export const DEFAULT: t.IHttpConfig = {
  title: 'Untitled',
  collection: 'cell.http',
  db: {
    dev: 'dev',
    test: 'test',
    staging: 'staging',
    prod: 'prod',
  },
};

/**
 * Loads the configuration [file: "cell.http.yml"]
 */
export async function load(args: ILoadArgs = {}) {
  // Path.
  const path = args.path ? fs.resolve(args.path) : fs.resolve('config.yml');
  const exists = await fs.pathExists(path);
  if (!exists && args.throw) {
    throw new Error(`Config file does not exist: ${path}`);
  }

  // Load file.
  let data = DEFAULT;
  if (exists) {
    const yaml = await fs.file.loadAndParse<t.IHttpConfig>(path, DEFAULT);
    data = R.mergeDeepRight(data, yaml);
  }

  // Finish up.
  const res: ILoadResponse = { path, exists, data };
  return res;
}
