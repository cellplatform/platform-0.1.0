import * as t from '../web/common/types';
export * from '../web/common';

/**
 * Standard error construction.
 */
export function toVimeoError(res: t.HttpResponse, message: string): t.VimeoHttpError {
  const json = res.json as any;
  return {
    code: json.error_code,
    message,
    detail: `[${res.status}] ${json.developer_message}`,
  };
}
