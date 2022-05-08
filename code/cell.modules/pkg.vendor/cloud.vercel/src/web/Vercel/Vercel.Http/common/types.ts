import * as t from '../../../common/types';

/**
 * Export
 */
export * from '../../../common/types';
export * from '../types';

/**
 * Internal
 */
type Q = Record<string, string | number | undefined>;

export type Ctx = {
  headers: { [key: string]: string };
  token: string;
  Authorization: string;
  fs: t.Fs;
  http: t.Http;
  url(version: number, path: string, query?: Q): string;
};
