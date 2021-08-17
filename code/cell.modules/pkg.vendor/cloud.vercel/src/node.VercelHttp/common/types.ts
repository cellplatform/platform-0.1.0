import { INodeFs, Http, HttpMethod } from '../../node/common/types';

export * from '../../web/common/types';
export * from '../types';
export { INodeFs, Http, HttpMethod };

/**
 * Internal
 */

type Q = Record<string, string | number | undefined>;

export type Ctx = {
  version: number;
  token: string;
  headers: { [key: string]: string };
  Authorization: string;
  fs: INodeFs;
  http: Http;
  url(path: string, query?: Q, options?: { version?: number }): string;
};
