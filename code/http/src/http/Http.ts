import { create } from './http.create';
import { fetch } from './fetch';
import { Mime, toRawHeaders, fromRawHeaders } from '../common';

export class Http {
  public static create = create;
  public static fetch = fetch;
  public static mime = Mime;
  public static toRawHeaders = toRawHeaders;
  public static fromRawHeaders = fromRawHeaders;
}
