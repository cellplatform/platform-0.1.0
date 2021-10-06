import { INodeFs, Http, HttpMethod, Fs } from '../../node/common/types';

export * from '../../web/common/types';
export * from '../types';
export { INodeFs, Http, HttpMethod, Fs };

/**
 * Internal
 */

type Q = Record<string, string | number | undefined>;

export type Ctx = {
  token: string;
  headers: { [key: string]: string };
  Authorization: string;
  fs: Fs;
  http: Http;
  url(version: number, path: string, query?: Q): string;
};
