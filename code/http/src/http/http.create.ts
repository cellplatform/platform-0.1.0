import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { t } from '../common';
import { fetch } from './fetch';
import { fetcher } from './http.fetcher';

export const create: t.HttpCreate = (options = {}) => {
  const mergeOptions = (methodOptions: t.IHttpOptions = {}) => {
    const args = {
      ...options,
      ...methodOptions,
      headers: { ...options.headers, ...methodOptions.headers },
    };
    const { mode = 'cors', headers } = args;
    return { mode, headers };
  };

  const invoke = (
    method: t.HttpMethod,
    args: { url: string; data?: any; options?: t.IHttpOptions },
  ) => {
    const { mode, headers } = mergeOptions(args.options);
    const { url, data } = args;
    return fetcher({ method, url, mode, headers, data, fire, fetch: options.fetch || fetch });
  };

  const _events$ = new Subject<t.HttpEvent>();
  const fire: t.FireEvent = e => _events$.next(e);

  const events$ = _events$.pipe(share());
  const before$ = _events$.pipe(
    filter(e => e.type === 'HTTP/before'),
    map(e => e.payload as t.IHttpBefore),
    share(),
  );
  const after$ = _events$.pipe(
    filter(e => e.type === 'HTTP/after'),
    map(e => e.payload as t.IHttpAfter),
    share(),
  );

  const http: t.IHttp = {
    create(options: t.IHttpCreateOptions = {}) {
      const headers = { ...http.headers, ...options.headers };
      return create({ ...options, headers });
    },

    events$,
    before$,
    after$,

    get headers() {
      return { ...options.headers };
    },

    /**
     * HEAD
     */
    async head(url: string, options: t.IHttpOptions = {}): Promise<t.IHttpResponse> {
      return invoke('HEAD', { url, options });
    },

    /**
     * GET
     */
    async get(url: string, options: t.IHttpOptions = {}): Promise<t.IHttpResponse> {
      return invoke('GET', { url, options });
    },

    /**
     * PUT
     */
    async put(url: string, data?: any, options: t.IHttpOptions = {}): Promise<t.IHttpResponse> {
      return invoke('PUT', { url, data, options });
    },

    /**
     * POST
     */
    async post(url: string, data?: any, options: t.IHttpOptions = {}): Promise<t.IHttpResponse> {
      return invoke('POST', { url, data, options });
    },

    /**
     * PATCH
     */
    async patch(url: string, data?: any, options: t.IHttpOptions = {}): Promise<t.IHttpResponse> {
      return invoke('PATCH', { url, data, options });
    },

    /**
     * DELETE
     */
    async delete(url: string, data?: any, options: t.IHttpOptions = {}): Promise<t.IHttpResponse> {
      return invoke('DELETE', { url, data, options });
    },
  };

  return http;
};
