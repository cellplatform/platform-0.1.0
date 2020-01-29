import { fs, log, t, util } from '../common';

export * from '../common/util';

/**
 * Convert a sync status to a log color.
 */
export function toStatusColor(args: {
  status: t.FsSyncFileStatus;
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

/**
 * Calculate the size of a set of payload items.
 */
export function toPayloadSize(
  items: t.IFsSyncPayloadFile[],
  options: { target?: 'LOCAL' | 'REMOTE' } = {},
) {
  const { target = 'LOCAL' } = options;
  const getBytes = (item: t.IFsSyncPayloadFile) =>
    target === 'LOCAL' ? item.localBytes : item.remoteBytes;

  const bytes = (items || [])
    .filter(item => getBytes(item) > -1)
    .map(item => getBytes(item))
    .reduce((acc, next) => acc + next, 0);
  return {
    bytes,
    toString: () => fs.size.toString(bytes),
  };
}

/**
 * Format the length of a line.
 */
export const formatLength = (line: string, max: number) => {
  if (line.length <= max) {
    return line;
  } else {
    const ellipsis = '..';
    const index = line.length - (max + ellipsis.length - 2);
    line = line.substring(index);
    line = `${ellipsis}${line}`;
    return line;
  }
};
