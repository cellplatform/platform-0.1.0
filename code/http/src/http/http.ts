import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { fetch, t } from '../common';
import { httpFetch } from './http.fetch';

// Export native fetch in case it's ever needed.
// Typically it won't be, use the [IHttp] client.
export { fetch };

export const create: t.HttpCreate = (options = {}) => {
  const mergeOptions = (methodOptions: t.IFetchOptions) => {
    const args = {
      ...options,
      ...methodOptions,
      headers: { ...options.headers, ...methodOptions.headers },
    };
    const { mode = 'cors', headers } = args;
    return { mode, headers };
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
    create,
    events$,
    before$,
    after$,

    get headers() {
      return { ...options.headers };
    },

    /**
     * HEAD
     */
    async head(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const method: t.HttpMethod = 'HEAD';
      return httpFetch({ url, method, options: mergeOptions(options), fire });
    },

    /**
     * GET
     */
    async get(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const method: t.HttpMethod = 'GET';
      return httpFetch({ url, method, options: mergeOptions(options), fire });
    },

    /**
     * PUT
     */
    async put(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const method: t.HttpMethod = 'PUT';
      return httpFetch({ url, method, data, options: mergeOptions(options), fire });
    },

    /**
     * POST
     */
    async post(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const method: t.HttpMethod = 'POST';
      return httpFetch({ url, method, data, options: mergeOptions(options), fire });
    },

    /**
     * PATCH
     */
    async patch(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const method: t.HttpMethod = 'PATCH';
      return httpFetch({ url, method, data, options: mergeOptions(options), fire });
    },

    /**
     * DELETE
     */
    async delete(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const method: t.HttpMethod = 'DELETE';
      return httpFetch({ url, method, data, options: mergeOptions(options), fire });
    },
  };

  return http;
};
