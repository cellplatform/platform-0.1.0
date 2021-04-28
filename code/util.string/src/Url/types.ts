import { UrlQueryObject } from '../QueryString/types';

export type Url = {
  href: string;
  host: string;
  hostname: string;
  port: number;
  protocol: 'http' | 'https';
  path: string;
  hashstring: string;
  querystring: string;
  hash<T extends UrlQueryObject = UrlQueryObject>(): T;
  query<T extends UrlQueryObject = UrlQueryObject>(): T;
  toString(): string;
};
