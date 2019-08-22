import { jsYaml, fs, log, semver } from './libs';

/**
 * Convert a value safely to a string.
 */
export const asString = (value?: any) =>
  (typeof value === 'string' ? (value as string) : '').trim();

/**
 * Safely parse YAML.
 */
export function parseYaml(text: string) {
  try {
    const data = jsYaml.safeLoad(text);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}

/**
 * Strip an "http://" prefix.
 */
export function stripHttp(input?: string) {
  return asString(input)
    .replace(/^https/, '')
    .replace(/^http/, '')
    .replace(/^\:\/\//, '');
}

/**
 * Strips "/" characters.
 */
export function stripSlashes(input?: string) {
  return asString(input)
    .replace(/^\/*/, '')
    .replace(/\/*$/, '');
}

/**
 * Formats a path to be a display path.
 */
export function formatPath(path: string) {
  const file = fs.basename(path);
  const dir = fs.dirname(path);
  return log.gray(`${dir}/${log.cyan(file)}`);
}

/**
 * Finds the first semver from the list of strings (version/path value).
 */
export function firstSemver(...versionOrPath: Array<string | undefined>) {
  const values = versionOrPath
    .filter(value => typeof value === ('string' as string))
    .map(value => (value as string).trim() as string)
    .filter(value => Boolean(value))
    .map(value => fs.basename(value));

  return values.find(value => semver.valid(value));
}

/**
 * Determines if the given domain is a regex.
 */
export function isDomainRegex(domain?: string) {
  return domain ? domain.startsWith('/') && domain.endsWith('/') : false;
}
