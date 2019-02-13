import { value } from '../value';
import { ITimer, TimerUnit, IDuration } from './types';

/**
 * Starts a timer.
 */
export function timer(start?: Date) {
  let startedAt = start || new Date();
  const api: ITimer = {
    startedAt,
    reset() {
      startedAt = new Date();
      return api;
    },
    elapsed(unit: TimerUnit = 'msec') {
      const duration = elapsed(startedAt);
      switch (unit) {
        case 'ms':
        case 'msec':
          return duration.msec;
        case 's':
        case 'sec':
          return value.round(duration.sec, 1);

        default:
          throw new Error(`Unit '${unit}' not supported `);
      }
    },
  };
  return api;
}

/**
 * Retrieves the elapsed milliseconds from the given date.
 */
export function elapsed(from: Date): IDuration {
  const now = new Date();
  const msec = now.getTime() - from.getTime();
  return {
    get msec() {
      return msec;
    },
    get ms() {
      return msec;
    },
    get sec() {
      return msec / 1000;
    },
    get s() {
      return this.sec;
    },
  };
}
