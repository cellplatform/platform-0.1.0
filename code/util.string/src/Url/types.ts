import { UrlQueryObject } from '../QueryString/types';

export type Url = {
  href: string;
  protocol: 'http' | 'https';
  host: string;
  hostname: string;
  port: number;
  path: string;

  hashstring: string;
  querystring: string;

  isLocalhost: boolean;

  hash<T extends UrlQueryObject = UrlQueryObject>(): T;
  query<T extends UrlQueryObject = UrlQueryObject>(): T;

  toString(): string;
};
