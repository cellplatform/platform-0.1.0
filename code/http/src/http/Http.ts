import { Mime } from '@platform/util.mimetype';

import { fromRawHeaders, toRawHeaders } from '../common';
import { fetch } from './fetch';
import { create } from './http.create';

export class Http {
  public static create = create;
  public static fetch = fetch;
  public static mime = Mime;
  public static toRawHeaders = toRawHeaders;
  public static fromRawHeaders = fromRawHeaders;
}
