import { ERROR, t } from '../common';
import { getParams as getParamsFiles, ParamAnd } from '../route.cell.files/params';

const toString = (input?: any) => (input || '').toString().trim();
const toMessage = (msg: string) => `Malformed URI, ${msg}`;

/**
 * URL params for cell/file:uri
 * Note: This shares most of the URL pattern parts as the "by filename" route.
 */
export const getFileUriParams = (args: { params: t.IUrlParamsCellFileByFileUri }) => {
  return getFilenameParams(args);
};

/**
 * URL params for cell/file-name.
 */
export const getFilenameParams = (args: { params: t.IUrlParamsCellFileByName }) => {
  const params = args.params as ParamAnd;

  const { ns, key, cellUri } = getParamsFiles({ params });
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

  if (!data.filename) {
    error.message = toMessage('does not contain a filename');
    return { ...data, status: 400, error };
  }

  return { ...data, status: 200, error: undefined };
};
