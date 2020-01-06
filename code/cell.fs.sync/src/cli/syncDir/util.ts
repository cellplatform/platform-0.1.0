import * as t from './types';
import { log, util } from '../common';

export * from '../../common/util';

/**
 * Convert a sync status to a log color.
 */
export function toStatusColor(args: {
  status: t.Status;
  text?: string;
  delete?: boolean;
  force?: boolean;
}) {
  const { status } = args;
  const text = args.text || status;
  switch (status) {
    case 'ADDED':
      return log.green(text);
    case 'CHANGED':
      return log.yellow(text);
    case 'NO_CHANGE':
      return args.force ? log.cyan(text) : log.gray(text);
    case 'DELETED':
      return args.delete ? log.red(text) : log.gray(text);
    default:
      return text;
  }
}

/**
 * Pluralised words.
 */
export const plural = {
  change: util.plural('change', 'changes'),
  file: util.plural('file', 'files'),
};
