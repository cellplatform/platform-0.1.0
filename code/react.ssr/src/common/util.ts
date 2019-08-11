import { jsYaml, fs, log } from './libs';

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
export function stripHttp(input: string) {
  return asString(input)
    .replace(/^https/, '')
    .replace(/^http/, '')
    .replace(/^\:\/\//, '');
}

/**
 * Formats a path to be a display path.
 */
export function formatPath(path: string) {
  const file = fs.basename(path);
  const dir = fs.dirname(path);
  return log.gray(`${dir}/${log.cyan(file)}`);
}
