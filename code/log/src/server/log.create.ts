import { map } from 'rxjs/operators';

import { t, chalk, ColorFormatter, create as createLog } from './common';
import { format } from './log.format';
import { table } from './log.table';
import { stripAnsiColors } from './util.ansi';

/**
 * Creates a server log.
 */
export function create(): t.IServerLog {
  const color: ColorFormatter = (color, items) => chalk[color](items as any);

  const log: t.IServerLog = {
    ...createLog({ color }),
    table: (options?: t.ILogTableOptions) => table(log, options),
    stripAnsi: (text) => stripAnsiColors(text),
  };

  // Run the log events through a formatter that converts
  // the log items into pretty colors.
  const formatter = map<t.ILogAction, t.ILogAction>((e) => {
    if (e.type === 'LOG' || e.type === 'GROUP') {
      const output = format(e.payload as t.ILogEvent);
      return { ...e, payload: { ...e.payload, output } };
    } else {
      return e;
    }
  });
  log.events$ = log.events$.pipe(formatter);

  // Finish up.
  return log;
}
