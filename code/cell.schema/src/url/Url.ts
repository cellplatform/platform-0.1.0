import { value, R } from '../common';
import { Uri } from '../uri';

export type IUrl = {
  host: string;
  port?: number;
};

/**
 * Standardised construction of URLs for the HTTP service.
 */
export class Url {
  public static readonly uri = Uri;

  public static create(args: IUrl) {
    return new Url(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IUrl) {
    this.host = R.pipe(stripHttp, stripSlash, stripPort)(args.host);
    this.protocol = this.host.startsWith('localhost') ? 'http' : 'https';
    this.port = args.port || getPort(args.host) || 80;
    this.origin = `${this.protocol}://${this.host}`;
    this.origin = this.port === 80 ? this.origin : `${this.origin}:${this.port}`;
  }

  /**
   * [Fields]
   */
  public readonly protocol: 'http' | 'https';
  public readonly host: string;
  public readonly port: number;
  public readonly origin: string;
}

/**
 * [Helpers]
 */
function getPort(input: string) {
  const text = R.pipe(stripHttp, stripSlash)(input || '').split(':')[1];
  return text === undefined ? undefined : value.toNumber(text);
}

function stripHttp(input: string) {
  return (input || '').replace(/^http\:\/\//, '').replace(/^https\:\/\//, '');
}

function stripPort(input: string) {
  return (input || '').replace(/\:\d*$/, '');
}

function stripSlash(input: string) {
  return (input || '').replace(/^\/*/, '').replace(/\/*$/, '');
}
