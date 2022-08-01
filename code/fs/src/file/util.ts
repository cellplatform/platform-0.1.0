import { dirname, extname, resolve } from 'path';
import { fs, yaml } from '../common';

export type IBeforeFileSaveArgs = { path: string; text: string };

const SUPPORTED = ['json', 'yaml', 'yml'];

/**
 * Loads (and parses) the file at the given path.
 */
export async function loadAndParse<T>(path: string, defaultValue?: T): Promise<T> {
  path = resolve(path);
  if (!(await fs.pathExists(path))) {
    return defaultValue as T;
  }
  const lstat = await fs.lstat(path);
  if (!lstat.isFile()) {
    return defaultValue as T;
  }
  const text = await fs.readFile(path, 'utf-8');
  return parse(path, text) || defaultValue;
}

/**
 * Loads (and parses) the file at the given path.
 */
export function loadAndParseSync<T>(path: string, defaultValue?: T): T {
  path = resolve(path);
  if (!fs.pathExistsSync(path)) {
    return defaultValue as T;
  }
  const lstat = fs.lstatSync(path);
  if (!lstat.isFile()) {
    return defaultValue as T;
  }
  const text = fs.readFileSync(path, 'utf-8');
  return parse(path, text) || defaultValue;
}

/**
 * Stringify's and object and saves it to disk.
 */
export async function stringifyAndSave<T extends Record<string, unknown>>(
  path: string,
  data: T,
  options: {
    beforeSave?: (e: IBeforeFileSaveArgs) => Promise<string | void>;
  } = {},
) {
  const { beforeSave } = options;
  let text = stringify(path, data);
  path = resolve(path);

  // Run BEFORE handler.
  if (beforeSave) {
    const res = await beforeSave({ path, text });
    text = typeof res === 'string' ? res : text;
  }

  // Write the file.
  await fs.ensureDir(dirname(path));
  await fs.writeFile(path, text);
  return text;
}

/**
 * Stringify's and object and saves it to disk.
 */
export function stringifyAndSaveSync<T extends Record<string, unknown>>(
  path: string,
  data: T,
  options: { beforeSave?: (e: IBeforeFileSaveArgs) => string | void } = {},
) {
  const { beforeSave } = options;
  let text = stringify(path, data);
  path = resolve(path);

  // Run BEFORE handler.
  if (beforeSave) {
    const res = beforeSave({ path, text });
    text = typeof res === 'string' ? res : text;
  }

  // Write the file.
  fs.ensureDirSync(dirname(path));
  fs.writeFileSync(path, text);
  return text;
}

/**
 * [Internal]
 */
function parse(path: string, text: string) {
  const ext = extension(path);
  try {
    switch (ext) {
      case 'json':
        return JSON.parse(text);

      case 'yml':
      case 'yaml':
        return yaml.load(text);

      default:
        throw new Error(
          `The path '${path}' is not a supported file type for parsing. Supported types: ${SUPPORTED}`,
        );
    }
  } catch (error: any) {
    throw new Error(`Failed while parsing file '${path}'. ${error.message}`);
  }
}

function stringify(path: string, data: Record<string, unknown>) {
  const ext = extension(path);

  try {
    if (ext === 'json') {
      const json = JSON.stringify(data, null, '  ');
      return `${json}\n`;
    }
    if (ext === 'yml' || ext === 'yaml') {
      return yaml.dump(data);
    }
  } catch (error: any) {
    throw new Error(`Failed while parsing file '${path}'. ${error.message}`);
  }

  const err = `The path '${path}' is not a supported file type to stringify. Supported types: ${SUPPORTED}`;
  throw new Error(err);
}

function extension(path: string) {
  return extname(path).replace(/^\./, '');
}
