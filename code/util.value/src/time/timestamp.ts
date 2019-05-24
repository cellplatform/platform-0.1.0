import * as day from 'dayjs';
import { IDate } from './types';

/**
 * Retrieves a UTC timestamp.
 *
 */
export function toTimestamp(date?: Date) {
  date = date || new Date();
  return date.getTime();
}

/**
 * Converts a timestamp into a Date.
 */
export function fromTimestamp(timestamp: number) {
  return new Date(timestamp);
}

/**
 * Helpers for working with
 */
export function utc(input?: Date | number) {
  const date =
    input === undefined ? new Date() : typeof input === 'object' ? input : fromTimestamp(input);
  const res: IDate = {
    get date() {
      return date;
    },
    get timestamp() {
      return toTimestamp(date);
    },
    get unix() {
      return day(date).unix();
    },
  };
  return res;
}
