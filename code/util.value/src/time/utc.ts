import * as day from 'dayjs';
import { IDate } from './types';

/**
 * Helpers for working with
 */
export function utc(input?: number | string | Date | day.Dayjs) {
  const date = day(input);
  const res: IDate = {
    get date() {
      return date.toDate();
    },
    get timestamp() {
      return date.toDate().getTime();
    },
    get unix() {
      return date.unix();
    },
  };
  return res;
}
