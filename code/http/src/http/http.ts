import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { t } from '../common';
import { fetcher } from './http.fetch';

export const create: t.HttpCreate = (options = {}) => {
  const mergeOptions = (methodOptions: t.HttpOptions = {}) => {
    const args = {
      ...options,
      ...methodOptions,
      headers: { ...options.headers, ...methodOptions.headers },
    };
    const { mode = 'cors', headers } = args;
    return { mode, headers };
  };
  const fetch = (
    method: t.HttpMethod,
    args: { url: string; data?: any; options?: t.HttpOptions },
  ) => {
    const { mode, headers } = mergeOptions(args.options);
    const { url, data } = args;
    return fetcher({ method, url, mode, headers, data, fire });
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
    async head(url: string, options: t.HttpOptions = {}): Promise<t.IHttpResponse> {
      return fetch('HEAD', { url, options });
    },

    /**
     * GET
     */
    async get(url: string, options: t.HttpOptions = {}): Promise<t.IHttpResponse> {
      return fetch('GET', { url, options });
    },

    /**
     * PUT
     */
    async put(url: string, data?: any, options: t.HttpOptions = {}): Promise<t.IHttpResponse> {
      return fetch('PUT', { url, data, options });
    },

    /**
     * POST
     */
    async post(url: string, data?: any, options: t.HttpOptions = {}): Promise<t.IHttpResponse> {
      return fetch('POST', { url, data, options });
    },

    /**
     * PATCH
     */
    async patch(url: string, data?: any, options: t.HttpOptions = {}): Promise<t.IHttpResponse> {
      return fetch('PATCH', { url, data, options });
    },

    /**
     * DELETE
     */
    async delete(url: string, data?: any, options: t.HttpOptions = {}): Promise<t.IHttpResponse> {
      return fetch('DELETE', { url, data, options });
    },
  };

  return http;
};
