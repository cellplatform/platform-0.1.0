import { fromRawHeaders, Mime as mime, toRawHeaders } from '../common';
import { fetch } from './fetch';
import { create } from './http.create';

export const Http = {
  create,
  fetch,
  mime,
  toRawHeaders,
  fromRawHeaders,
};
