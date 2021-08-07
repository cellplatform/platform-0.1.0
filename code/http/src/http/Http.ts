import { Mime as mime } from '@platform/util.mimetype';

import { fromRawHeaders, toRawHeaders, t } from '../common';
import { fetch } from './fetch';
import { create } from './http.create';

export const Http = {
  create,
  fetch,
  mime,
  toRawHeaders,
  fromRawHeaders,
};
