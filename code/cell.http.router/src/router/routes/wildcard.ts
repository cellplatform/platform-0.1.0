import { ERROR, t } from './common';

/**
 * Handle any un-matched routes.
 */
export const wildcard: t.RouteHandler = async req => {
  /**
   * OPTIONS: Cors Preflight.
   */
  if (req.method === 'OPTIONS') {
    return corsPreflight(req);
  }

  /**
   * 404 Not Found.
   */
  const status = 404;
  const data: t.IHttpError = {
    status,
    type: ERROR.HTTP.NOT_FOUND,
    message: 'Resource not found.',
  };
  return { status, data };
};

/**
 * Handle CORS preflight.
 * NOTE:
 *    In the future we may want to narrow this down,
 *    inspecting what the request is, and only allowing
 *    the request to pass the "CORS pre-flight" check
 *    if certain conditions are met.
 */
const corsPreflight = (req: t.HttpRequest) => {
  const KEY = {
    ORIGIN: 'origin',
    REQUEST: {
      METHOD: 'access-control-request-method',
      HEADERS: 'access-control-request-headers',
    },
    ALLOW: {
      METHOD: 'access-control-allow-method',
      HEADERS: 'access-control-allow-headers',
    },
  };

  const origin = req.header(KEY.ORIGIN);
  const requestMethod = req.header(KEY.REQUEST.METHOD);
  const requestHeaders = req.header(KEY.REQUEST.HEADERS);

  const headers = {
    [KEY.ORIGIN]: origin,
    [KEY.ALLOW.METHOD]: requestMethod,
    [KEY.ALLOW.HEADERS]: requestHeaders,
  };

  return { status: 200, headers };
};
