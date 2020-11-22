import { fs, log, parseUrl, R } from './libs';

const trim = (value?: string | null) => (value || '').trim();
const slashes = (value: string) => value.replace(/\//g, log.gray('/'));

/**
 * Helpers for formatting strings.
 */
export const format = {
  trim,
  slashes,

  url(value: string) {
    value = trim(value);
    const parsed = parseUrl(value);
    const domain = log.gray(`${parsed.protocol}//${parsed.host}`);
    const path = R.pipe(trim, format.uri, slashes)(parsed.pathname || '');
    const suffix = parsed.search ? log.gray(parsed.search) : '';
    const url = `${domain}${path}${suffix}`;
    return log.white(url);
  },

  uri(value: string) {
    value = format
      .trim(value)
      .replace(/cell\:/g, log.cyan('cell:'))
      .replace(/\:/g, log.gray(':'));
    return log.white(value);
  },

  filepath(value: string) {
    value = trim(value);
    const dir = fs.dirname(value);
    const base = fs.basename(value);
    return log.gray(`${dir}/${log.white(base)}`);
  },
};
