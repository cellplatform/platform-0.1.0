/**
 * Inlined from the [node] `http` module
 */

export type IncomingMessage = {
  // NB: Subset of full [node] props.
  method?: string;
  url?: string;
  statusCode?: number;
  statusMessage?: string;
  headers: IncomingHttpHeaders;
};

// incoming headers will never contain number
export type IncomingHttpHeaders = {
  accept?: string;
  'accept-language'?: string;
  'accept-patch'?: string;
  'accept-ranges'?: string;
  'access-control-allow-credentials'?: string;
  'access-control-allow-headers'?: string;
  'access-control-allow-methods'?: string;
  'access-control-allow-origin'?: string;
  'access-control-expose-headers'?: string;
  'access-control-max-age'?: string;
  age?: string;
  allow?: string;
  'alt-svc'?: string;
  authorization?: string;
  'cache-control'?: string;
  connection?: string;
  'content-disposition'?: string;
  'content-encoding'?: string;
  'content-language'?: string;
  'content-length'?: string;
  'content-location'?: string;
  'content-range'?: string;
  'content-type'?: string;
  cookie?: string;
  date?: string;
  expect?: string;
  expires?: string;
  forwarded?: string;
  from?: string;
  host?: string;
  'if-match'?: string;
  'if-modified-since'?: string;
  'if-none-match'?: string;
  'if-unmodified-since'?: string;
  'last-modified'?: string;
  location?: string;
  pragma?: string;
  'proxy-authenticate'?: string;
  'proxy-authorization'?: string;
  'public-key-pins'?: string;
  range?: string;
  referer?: string;
  'retry-after'?: string;
  'set-cookie'?: string[];
  'strict-transport-security'?: string;
  tk?: string;
  trailer?: string;
  'transfer-encoding'?: string;
  upgrade?: string;
  'user-agent'?: string;
  vary?: string;
  via?: string;
  warning?: string;
  'www-authenticate'?: string;
  [header: string]: string | string[] | undefined;
};
