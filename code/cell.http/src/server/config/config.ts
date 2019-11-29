import { t, fs, R } from '../common';

export type IConfigArgs = { path?: string; throw?: boolean };
export type IConfigResponse = {
  path: string;
  exists: boolean;
  data: t.IConfigCloud;
  validate(): IValidation;
};

export type IValidation = {
  isValid: boolean;
  errors: t.IError[];
};

export const DEFAULT: t.IConfigCloud = {
  title: 'Untitled',
  collection: 'cell.http',
  now: {
    deployment: '',
    domain: '',
    subdomain: undefined,
    mongo: '',
  },
};

/**
 * Loads the configuration [file: "cell.http.yml"]
 */
export function loadSync(args: IConfigArgs = {}) {
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

  const config: IConfigResponse = {
    path: exists ? file : path,
    exists,
    data,
    validate: () => validate(config),
  };

  // Finish up.
  return config;
}

/**
 * [Helpers]
 */

function validate(config: IConfigResponse) {
  const data = config.data;
  const errors: t.IError[] = [];
  const res: IValidation = {
    get isValid() {
      return errors.length === 0;
    },
    errors,
  };

  const error = (message: string) => {
    const error: t.IError = { type: 'HTTP/config', message };
    errors.push(error);
    return res;
  };

  if (!config.exists) {
    return error(`Configuration file does not exist.`);
  }

  if (!(data.title || '').trim()) {
    error('Missing [title] value.');
  }

  ['deployment', 'domain', 'mongo'].forEach(field => {
    const value = ((data.now || {})[field] || '').trim();
    if (!value) {
      error(`Missing [now.${field}] value.`);
    }
  });

  return res;
}
