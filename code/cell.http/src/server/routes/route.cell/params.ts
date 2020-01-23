import { ERROR, t } from '../common';

type Prefix = 'cell' | 'col' | 'row';
export const getParams = (args: {
  req: t.Request;
  prefix: Prefix;
  getUri: (id: string, key: string) => string;
}) => {
  const { req, prefix } = args;
  const params = args.req.params as t.IUrlParamsCoord;

  const data = {
    ns: (params.ns || '').toString(),
    key: (params.key || '').toString(),
    uri: '',
  };

  const error: t.IError = {
    type: ERROR.HTTP.MALFORMED_URI,
    message: '',
  };

  const toMessage = (msg: string) => `Malformed "${prefix}:" URI, ${msg} ("${req.url}").`;

  if (!data.ns) {
    error.message = toMessage('does not contain a namespace-identifier');
    return { ...data, status: 400, error };
  }

  if (!data.key) {
    error.message = toMessage('does not contain a coordinate position');
    return { ...data, status: 400, error };
  }

  try {
    data.uri = args.getUri(data.ns, data.key);
  } catch (err) {
    error.message = toMessage(err.message);
    return { ...data, status: 400, error };
  }

  return { ...data, status: 200, error: undefined };
};
