import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { Loggable, ILog, LogLevel, ILogEvent, LogNext, ILogAction, LogColor } from '../types';
import { METHODS, COLORS } from './constants';

export type ColorFormatter = (color: LogColor, items: Loggable[]) => any;

/**
 * Create a generic log.
 */
export function create(options: { color: ColorFormatter }): ILog {
  const logger = createLogger();

  const next = (level: LogLevel, items: Loggable[]) => logger.next(level, 'black', items) as any;

  const logMethod = (level: LogLevel) => (...items: Loggable[]) => next(level, items);

  const TODO = (...items: Loggable[]) => next('warn', ['TODO:', ...items]);

  const log = {
    silent: false,
    events$: logger.events$,
    info: logMethod('info'),
    warn: logMethod('warn'),
    error: logMethod('error'),
    DEBUG: logMethod('warn'),
    TODO,
    clear: () => logger.clear(),
    group: (...items: Loggable[]) => logger.group(items),
    groupEnd: () => logger.groupEnd(),
  };

  // Assign color/method variants to the API.
  configureMethods(log as ILog, options.color, logger.next);

  // Finish up.
  return log as ILog;
}

/**
 * INTERNAL
 */
function createLogger() {
  const events$ = new Subject<ILogAction>();
  return {
    events$: events$.pipe(share()),
    next(level: LogLevel, color: LogColor, items: Loggable[]) {
      const payload: ILogEvent = {
        level,
        color,
        items,
        output: items,
      };
      events$.next({ type: 'LOG', payload });
      return items.join(' ');
    },
    clear() {
      events$.next({ type: 'CLEAR', payload: {} });
    },
    group(items: Loggable[]) {
      const payload: ILogEvent = {
        level: 'info',
        color: 'white',
        items,
        output: items,
      };
      events$.next({ type: 'GROUP', payload });
      return items.join(' ');
    },
    groupEnd() {
      events$.next({ type: 'UNGROUP', payload: {} });
    },
  };
}

function configureMethods(log: ILog, colorFormatter: ColorFormatter, next: LogNext) {
  const applyMethodColors = (level: LogLevel, obj: any) => {
    const method = (color: LogColor) => (...items: Loggable[]) => next(level, color, items);
    COLORS.forEach(color => (obj[color] = method(color)));
  };

  METHODS.forEach((level: LogLevel) => applyMethodColors(level, log[level]));

  COLORS.forEach(color => {
    log[color] = (items: Loggable) => colorFormatter(color, items);
  });
}
