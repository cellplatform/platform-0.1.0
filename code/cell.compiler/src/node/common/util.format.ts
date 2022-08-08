import { fs, log, Uri } from './libs';

const { white, gray, cyan } = log;
const trim = (value?: string | null) => (value || '').trim();
const slashes = (value: string) => value.replace(/\//g, gray('/'));

/**
 * Helpers for formatting strings.
 */
export const Format = {
  trim,
  slashes,

  url(value: string) {
    value = trim(value);
    const parsed = new URL(value);
    const domain = `${parsed.protocol}//${parsed.host}`;
    const parts = parsed.pathname.split('/').slice(1);

    const uri = parts[0].includes(':') ? parts[0] : '';
    parts.shift();

    const path: string[] = [];
    const isFilesystem = uri.startsWith('cell:') && parts[0] === 'fs';

    if (isFilesystem) {
      path.push(cyan('fs'));
      parts.shift();
    }

    path.push(...parts.map((p) => white(p)));
    const suffix = parsed.search ? gray(parsed.search) : '';
    const url = `${domain}/${Format.uri(uri)}/${path.join(gray('/'))}${suffix}`;
    return gray(url);
  },

  uri(value: string) {
    value = trim(value);
    if (!Uri.is.uri(value)) return value;

    const parts = value.split(':');
    return parts.length < 3 ? value : gray(`${cyan(parts[0])}:${parts[1]}:${white(parts[2])}`);
  },

  filepath(value: string) {
    value = trim(value);
    const dir = fs.dirname(value);
    const base = fs.basename(value);
    return gray(`${dir}/${white(base)}`);
  },
};
