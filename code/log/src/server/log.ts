import * as nodeUtil from 'util';
import { map, filter } from 'rxjs/operators';
import { R, create as createLog, chalk, ColorFormatter } from './common';
import { table } from './log.table';
import {
  LogLevel,
  ILogEvent,
  IServerLog,
  ILogTableOptions,
  ILogAction,
} from './types';

/**
 * Creates a server log.
 */
export function create(): IServerLog {
  const color: ColorFormatter = (color, items) => chalk[color](items as any);

  const log: IServerLog = {
    ...createLog({ color }),
    table: (options?: ILogTableOptions) => table(log, options),
  };

  // Run the log events through a formatter that converts the
  // log items into pretty colors.
  const formatter = map<ILogAction, ILogAction>(e => {
    switch (e.type) {
      case 'LOG':
      case 'GROUP':
        const output = format(e.payload as ILogEvent);
        return { ...e, payload: { ...e.payload, output } };

      default:
        return e;
    }
  });
  log.events$ = log.events$.pipe(formatter);

  // Finish up.
  return log;
}

/**
 * Create default log that writes to the console.
 */
export const log = create();
export default log;

const events$ = log.events$.pipe(filter(() => !log.silent));
events$
  // Logging.
  .pipe(filter(e => e.type === 'LOG'))
  .pipe(map(e => e.payload as ILogEvent))
  .subscribe(e => console.log(e.output));

events$
  // Clear console.
  .pipe(filter(e => e.type === 'CLEAR'))
  .subscribe(e => console.clear());

events$
  // Group.
  .pipe(filter(e => e.type === 'GROUP'))
  .pipe(map(e => e.payload as ILogEvent))
  .subscribe(e => console.group(e.output));

events$
  // End group.
  .pipe(filter(e => e.type === 'UNGROUP'))
  .subscribe(e => console.groupEnd());

/**
 * Formats a lot event.
 */
export function format(e: ILogEvent) {
  const { level, color } = e;

  // Convert objects to JSON.
  const items = e.items.map(item => {
    if (item instanceof Error) {
      return item.stack;
    }

    // Object formatted with colors (JSON).
    if (R.is(Object, item)) {
      return nodeUtil.inspect(item, false, undefined, true);
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

function levelColor(level: LogLevel, item: any): string {
  switch (level) {
    case 'warn':
      return chalk.yellow(item);
    case 'error':
      return chalk.red(item);
    default:
      return item;
  }
}
