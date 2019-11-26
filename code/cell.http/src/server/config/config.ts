import { t, fs, R } from '../common';

export type ILoadArgs = { path?: string; throw?: boolean };
export type ILoadResponse = { path: string; exists: boolean; data: t.IConfigCloud };

export const DEFAULT: t.IConfigCloud = {
  title: 'Untitled',
  collection: 'cell.http',
  now: {
    name: '',
    domain: '',
    subdomain: undefined,
    mongo: '',
  },
};

/**
 * Loads the configuration [file: "cell.http.yml"]
 */
export function loadSync(args: ILoadArgs = {}) {
  // Path.
  const path = args.path ? fs.resolve(args.path) : fs.resolve('config.yml');
  const dir = fs.dirname(path);
  const filename = fs
    .basename(path)
    .trim()
    .replace(/\.yml$/, '')
    .replace(/\.yaml$/, '')
    .trim();

  const ext =
    ['yml', 'yaml'].find(ext => {
      return fs.pathExistsSync(fs.join(dir, `${filename}.${ext}`));
    }) || '';
  const file = fs.join(dir, `${filename}.${ext}`);

  const exists = fs.pathExistsSync(file);
  if (!exists && args.throw) {
    throw new Error(`Config file does not exist: ${path}`);
  }

  // Load file.
  let data = DEFAULT;
  if (exists) {
    const yaml = fs.file.loadAndParseSync<t.IConfigCloud>(file, DEFAULT);
    data = R.mergeDeepRight(data, yaml);
    data.now.mongo = data.now.mongo ? `@${data.now.mongo.replace(/^\@/, '')}` : ''; // Prepend "@" symbol for `zeit/now`.
  }

  // Finish up.
  const res: ILoadResponse = { path: exists ? file : path, exists, data };
  return res;
}
