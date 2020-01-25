import { defaultValue, ERROR, t } from '../common';
import { getParams as getParamsFiles, ParamAnd, ParamOr } from '../route.cell.files/params';

export const getParams = (args: { params: ParamOr; filenameRequired?: boolean }) => {
  const params = args.params as ParamAnd;
  const toString = (input?: any) => (input || '').toString().trim();
  const toMessage = (msg: string) => `Malformed URI, ${msg}`;

  const res = getParamsFiles({ params });
  const { ns, key, cellUri } = res;
  const data = {
    ns,
    key,
    cellUri,
    filename: toString(params.filename || ''),
  };

  const error: t.IError = {
    type: ERROR.HTTP.MALFORMED_URI,
    message: '',
  };

  if (!data.filename && args.filenameRequired) {
    error.message = toMessage('does not contain a filename');
    return { ...data, status: 400, error };
  }

  return { ...data, status: 200, error: undefined };
};
