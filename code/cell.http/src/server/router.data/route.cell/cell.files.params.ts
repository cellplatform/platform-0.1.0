import { t, defaultValue, constants, Schema } from '../common';

type ParamOr = t.IUrlParamsCellFiles | t.IUrlParamsCellFileByName | t.IUrlParamsCellFileByIndex;
type ParamAnd = t.IUrlParamsCellFiles & t.IUrlParamsCellFileByName & t.IUrlParamsCellFileByIndex;

export const getParams = (args: {
  params: ParamOr;
  filenameRequired?: boolean;
  indexRequired?: boolean;
}) => {
  const params = args.params as ParamAnd;
  const toString = (input?: any) => (input || '').toString().trim();

  const data = {
    ns: toString(params.ns || ''),
    key: toString(params.key || ''),
    filename: toString(params.filename || ''),
    index: defaultValue<number>(params.index as number, -1),
    uri: '',
  };

  const error: t.IError = {
    type: constants.ERROR.HTTP.MALFORMED_URI,
    message: '',
  };

  const toMessage = (msg: string) => `Malformed URI, ${msg}`;

  if (!data.ns) {
    error.message = toMessage('does not contain a namespace-identifier');
    return { ...data, status: 400, error };
  }

  if (!data.key) {
    error.message = toMessage('does not contain a cell key (eg A1)');
    return { ...data, status: 400, error };
  }

  if (!data.filename && args.filenameRequired) {
    error.message = toMessage('does not contain a filename');
    return { ...data, status: 400, error };
  }

  if (data.index < 0 && args.indexRequired) {
    error.message = toMessage('does not contain a file index');
    return { ...data, status: 400, error };
  }

  try {
    data.uri = Schema.uri.create.cell(data.ns, data.key);
  } catch (err) {
    error.message = toMessage(err.message);
    return { ...data, status: 400, error };
  }

  return { ...data, status: 200, error: undefined };
};
