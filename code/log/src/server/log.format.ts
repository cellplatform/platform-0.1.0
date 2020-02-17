import { inspect } from 'util';
import { t, chalk } from './common';

/**
 * Formats a log event.
 */
export function format(e: t.ILogEvent) {
  const { level, color } = e;

  // Convert objects to JSON.
  const items = e.items.map(item => {
    if (item instanceof Error) {
      return item.stack;
    }

    // Object formatted with colors (JSON).
    if (typeof item === 'object') {
      return inspect(item, false, undefined, true);
    }

    return item;
  });

  // Convert to final string.
  let output = items.join(' ');
  output = levelColor(level, output);
  output = color === 'black' ? output : chalk[color](output);

  // Finish up.
  return output;
}

/**
 * [Internal]
 */
function levelColor(level: t.LogLevel, item: any): string {
  switch (level) {
    case 'warn':
      return chalk.yellow(item);
    case 'error':
      return chalk.red(item);
    default:
      return item;
  }
}
