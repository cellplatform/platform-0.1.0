import { jsYaml } from '../common';

export const asString = (value?: any) =>
  (typeof value === 'string' ? (value as string) : '').trim();

export function parseYaml(text: string) {
  try {
    const data = jsYaml.safeLoad(text);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}

export function stripHttp(input: string) {
  return asString(input)
    .replace(/^https/, '')
    .replace(/^http/, '')
    .replace(/^\:\/\//, '');
}
