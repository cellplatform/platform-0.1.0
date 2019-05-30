import * as day from 'dayjs';
import { IDate } from './types';

/**
 * Helpers for working with
 */
export function utc(input?: Date | number) {
  const date =
    input === undefined ? new Date() : typeof input === 'object' ? input : new Date(input);
  const res: IDate = {
    get date() {
      return date;
    },
    get timestamp() {
      return date.getTime();
    },
    get unix() {
      return day(date).unix();
    },
  };
  return res;
}
