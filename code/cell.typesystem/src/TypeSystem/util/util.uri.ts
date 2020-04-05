import { t, Uri, defaultValue } from '../../common';

type FormatOptions = { throw?: boolean };

export const formatNsUri = (input?: string | t.INsUri, options?: FormatOptions) => {
  return format<t.INsUri>({ ...options, input, type: 'NS', prefix: 'ns' });
};

export const formatCellUri = (input?: string | t.ICellUri, options?: FormatOptions) => {
  return format<t.ICellUri>({ ...options, input, type: 'CELL', prefix: 'cell' });
};

export const formatRowUri = (input?: string | t.IRowUri, options?: FormatOptions) => {
  return format<t.IRowUri>({ ...options, input, type: 'ROW', prefix: 'cell' });
};

export const formatColumnUri = (input?: string | t.IColumnUri, options?: FormatOptions) => {
  return format<t.IColumnUri>({ ...options, input, type: 'COLUMN', prefix: 'cell' });
};

/**
 * [Helpers]
 */

const format = <U extends t.IUri>(args: {
  input?: U | string;
  prefix: string;
  type: t.UriType;
  throw?: boolean;
}) => {
  const { prefix } = args;
  let input = args.input || '';

  if (typeof input === 'string') {
    input = input.trim();
    input = !input ? '' : input.includes(':') ? input : `${prefix}:${input}`;
  }

  const uri = typeof input === 'object' ? input : Uri.parse<U>(input).parts;
  if (uri.type !== args.type && defaultValue(args.throw, true)) {
    throw new Error(`URI is not of type ${args.type} (given "${uri.toString()}")`);
  }

  return uri;
};
