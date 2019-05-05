import { value as valueUtil } from '../value';
import * as t from './types';

const { round } = valueUtil;

const MSEC = 1;
const SEC = MSEC * 1000;
const MIN = SEC * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;

/**
 * Starts a timer.
 */
export function timer(start?: Date, options: { round?: number } = {}) {
  let startedAt = start || new Date();
  const api: t.ITimer = {
    startedAt,
    reset() {
      startedAt = new Date();
      return api;
    },
    get elapsed() {
      return elapsed(startedAt, options);
    },
  };
  return api;
}

/**
 * Retrieves the elapsed milliseconds from the given date.
 */
export function elapsed(from: Date, options: { round?: number } = {}): t.IDuration {
  const now = new Date();
  const msec = now.getTime() - from.getTime();
  const defaultPrecision = options.round === undefined ? 1 : options.round;
  const duration: t.IDuration = {
    get msec() {
      return msec;
    },
    get sec() {
      return to.sec(msec, defaultPrecision);
    },
    get min() {
      return to.min(msec, defaultPrecision);
    },
    get hour() {
      return to.hour(msec, defaultPrecision);
    },
    get day() {
      return to.day(msec, defaultPrecision);
    },
    toString(unit?: t.TimerUnit) {
      const format = (unit: t.TimerUnit, round: number = 0) => {
        switch (unit) {
          case 'ms':
          case 'msec':
            return `${msec}ms`;

          case 's':
          case 'sec':
            return `${to.sec(msec, round)}s`;

          case 'm':
          case 'min':
            // const min = to.min(msec)
            return `${to.min(msec, round)}m`;

          case 'h':
          case 'hour':
            return `${to.hour(msec, round)}h`;

          case 'd':
          case 'day':
            return `${to.day(msec, round)}d`;

          default:
            throw new Error(`Unit '${unit}' not supported `);
        }
      };

      if (unit !== undefined) {
        return format(unit);
      }

      if (msec < SEC) {
        return format('ms');
      }

      if (msec < MIN) {
        return format('s');
      }

      if (msec < HOUR) {
        return format('m');
      }

      if (msec < DAY) {
        return format('h');
      }

      return format('d');
    },
  };
  return duration;
}

/**
 * [Helpers]
 */
const to = {
  sec: (msec: number, precision: number) => round(msec / 1000, precision),
  min: (msec: number, precision: number) => round(msec / 1000 / 60, precision),
  hour: (msec: number, precision: number) => round(msec / 1000 / 60 / 60, precision),
  day: (msec: number, precision: number) => round(msec / 1000 / 60 / 60 / 24, precision),
};
