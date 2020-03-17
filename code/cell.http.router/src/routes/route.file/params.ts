import { constants, Schema, t } from '../common';

export const getParams = (params: t.IUrlParamsFile) => {
  const data = {
    ns: (params.ns || '').toString(),
    file: (params.file || '').toString(),
    fileUri: '',
  };

  const error: t.IError = {
    type: constants.ERROR.HTTP.MALFORMED_URI,
    message: '',
  };

  const toMessage = (msg: string) => `Malformed "file:" URI. ${msg}`;

  if (!data.ns) {
    error.message = toMessage('does not contain a namespace-identifier');
    return { ...data, status: 400, error };
  }

  if (!data.file) {
    error.message = toMessage('does not contain a file-identifier');
    return { ...data, status: 400, error };
  }

  try {
    data.fileUri = Schema.uri.create.file(data.ns, data.file);
  } catch (err) {
    error.message = toMessage(err.message);
    return { ...data, status: 400, error };
  }

  return { ...data, status: 200, error: undefined };
};
